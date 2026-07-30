import { DeviceRepository } from "../repositories/device.repository";
import { HttpException } from "../exceptions/http-exception";

// Initialize Firebase Admin
let firebaseApp: any = null;
let initializationAttempted = false;
let firebaseAvailable = false;

export const initializeFirebase = () => {
    if (initializationAttempted) {
        return firebaseApp;
    }

    initializationAttempted = true;

    try {
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        
        if (!serviceAccountKey) {
            console.warn("Firebase service account key not provided. Push notifications will be disabled.");
            return null;
        }

        // Dynamic import to avoid module loading issues
        const admin = require("firebase-admin");
        
        if (!admin || typeof admin.initializeApp !== 'function') {
            console.warn("firebase-admin module is not properly loaded");
            return null;
        }

        const serviceAccount = JSON.parse(serviceAccountKey);

        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        firebaseAvailable = true;
        console.log("Firebase initialized successfully");
        return firebaseApp;
    } catch (error: any) {
        console.error("Failed to initialize Firebase:", error.message);
        console.log("Push notifications will be disabled");
        return null;
    }
};

// Singleton instance
let pushNotificationServiceInstance: PushNotificationService | null = null;

export const getPushNotificationService = () => {
    if (!pushNotificationServiceInstance) {
        pushNotificationServiceInstance = new PushNotificationService();
    }
    return pushNotificationServiceInstance;
};

export class PushNotificationService {
    private deviceRepository: DeviceRepository;
    private fcm: any;

    constructor() {
        this.deviceRepository = new DeviceRepository();
        // Don't initialize Firebase in constructor - do it lazily when needed
        this.fcm = null;
    }

    private ensureFirebaseInitialized() {
        if (!firebaseApp && !initializationAttempted) {
            initializeFirebase();
        }
        if (firebaseAvailable && !this.fcm) {
            const admin = require("firebase-admin");
            this.fcm = admin.messaging();
        }
    }

    /**
     * Send notification to a single user
     */
    async sendToUser(
        userId: string,
        notification: {
            title: string;
            body: string;
            data?: Record<string, string>;
        }
    ): Promise<{ success: number; failure: number }> {
        this.ensureFirebaseInitialized();
        
        if (!this.fcm) {
            console.warn("Firebase not initialized. Skipping push notification.");
            return { success: 0, failure: 0 };
        }

        const devices = await this.deviceRepository.getUserDevices(userId);
        
        if (devices.length === 0) {
            return { success: 0, failure: 0 };
        }

        const tokens = devices.map((d) => d.token);

        // @ts-ignore - Firebase Admin SDK TypeScript compatibility
        const message = {
            notification: {
                title: notification.title,
                body: notification.body,
            },
            data: notification.data,
            tokens: tokens,
        };

        try {
            const response = await this.fcm.sendMulticast(message);
            
            // Handle failed tokens
            if (response.failureCount > 0) {
                const failedTokens: string[] = [];
                response.responses.forEach((resp: any, idx: number) => {
                    if (!resp.success) {
                        failedTokens.push(tokens[idx]);
                    }
                });

                // Deactivate failed tokens
                for (const token of failedTokens) {
                    const device = await this.deviceRepository.getDeviceByToken(token);
                    if (device) {
                        await this.deviceRepository.deactivateDevice(userId, device._id.toString());
                    }
                }
            }

            return {
                success: response.successCount,
                failure: response.failureCount,
            };
        } catch (error: any) {
            console.error("Error sending push notification:", error);
            throw new HttpException(500, "Failed to send push notification");
        }
    }

    /**
     * Send notification to multiple users
     */
    async sendToUsers(
        userIds: string[],
        notification: {
            title: string;
            body: string;
            data?: Record<string, string>;
        }
    ): Promise<{ success: number; failure: number }> {
        let totalSuccess = 0;
        let totalFailure = 0;

        for (const userId of userIds) {
            const result = await this.sendToUser(userId, notification);
            totalSuccess += result.success;
            totalFailure += result.failure;
        }

        return { success: totalSuccess, failure: totalFailure };
    }

    /**
     * Send SOS alert notification
     */
    async sendSOSAlert(
        userId: string,
        safetyCircleUserIds: string[],
        location: { latitude: number; longitude: number }
    ): Promise<void> {
        const notification = {
            title: "🚨 SOS Alert",
            body: "Your safety circle member has triggered an SOS alert!",
            data: {
                type: "sos_alert",
                userId: userId,
                latitude: location.latitude.toString(),
                longitude: location.longitude.toString(),
                timestamp: new Date().toISOString(),
            },
        };

        await this.sendToUsers(safetyCircleUserIds, notification);
    }

    /**
     * Send incident notification
     */
    async sendIncidentNotification(
        userIds: string[],
        incident: {
            category: string;
            description: string;
            latitude: number;
            longitude: number;
        }
    ): Promise<void> {
        const notification = {
            title: `📍 New Incident: ${incident.category}`,
            body: incident.description,
            data: {
                type: "incident",
                category: incident.category,
                latitude: incident.latitude.toString(),
                longitude: incident.longitude.toString(),
                timestamp: new Date().toISOString(),
            },
        };

        await this.sendToUsers(userIds, notification);
    }

    /**
     * Send safety circle notification
     */
    async sendSafetyCircleNotification(
        userId: string,
        targetUserId: string,
        action: "added" | "removed" | "updated",
        memberName: string
    ): Promise<void> {
        const notifications: Record<string, { title: string; body: string }> = {
            added: {
                title: "👥 Safety Circle Updated",
                body: `${memberName} has been added to your safety circle`,
            },
            removed: {
                title: "👥 Safety Circle Updated",
                body: `${memberName} has been removed from your safety circle`,
            },
            updated: {
                title: "👥 Safety Circle Updated",
                body: `${memberName}'s information has been updated in your safety circle`,
            },
        };

        const notification = {
            title: notifications[action].title,
            body: notifications[action].body,
            data: {
                type: "safety_circle",
                action: action,
                targetUserId: targetUserId,
                timestamp: new Date().toISOString(),
            },
        };

        await this.sendToUser(userId, notification);
    }
}
