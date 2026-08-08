import { AlertModel, IAlert } from "../models/alert.model";
import { TriggerAlertDTOType } from "../dtos/alert.dto";
import { HttpException } from "../exceptions/http-exception";
import { ContactModel } from "../models/contact.model";
import { UserModel } from "../models/user.model";
import { NotificationModel } from "../models/notification.model";
import { socketService } from "../socket/socket.service";
import mongoose from "mongoose";

export class AlertService {
    async getActiveAlertForUser(userId: string) {
        return await AlertModel.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            status: "active",
        }).populate("userId", "firstName lastName email phoneNumber profilePicture");
    }

    async getActiveAlerts(): Promise<IAlert[]> {
        return await AlertModel.find({ status: "active" })
            .populate("userId", "firstName lastName email phoneNumber profilePicture")
            .sort({ triggeredAt: -1 });
    }

    async getMyAlerts(userId: string, page: number = 1, limit: number = 10): Promise<{ data: any[], meta: { page: number, limit: number, total: number, totalPages: number } }> {
        const skip = (page - 1) * limit;
        const total = await AlertModel.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });
        const totalPages = Math.ceil(total / limit);

        const data = await AlertModel.find({
            userId: new mongoose.Types.ObjectId(userId),
        })
            .sort({ triggeredAt: -1 })
            .skip(skip)
            .limit(limit);

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    private async getTrustedContactUserIds(userId: string): Promise<string[]> {
        const contacts = await ContactModel.find({
            userId: new mongoose.Types.ObjectId(userId),
            status: "accepted",
            targetUserId: { $ne: null },
        });

        return contacts
            .map((c) => c.targetUserId?.toString())
            .filter((id): id is string => Boolean(id));
    }

    async triggerAlert(userId: string, data: TriggerAlertDTOType) {
        const activeAlert = await this.getActiveAlertForUser(userId);
        if (activeAlert) {
            return activeAlert;
        }

        const user = await UserModel.findById(userId);

        const newAlert = new AlertModel({
            userId: new mongoose.Types.ObjectId(userId),
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address,
            status: "active",
            triggeredAt: new Date(),
        });

        await newAlert.save();

        const trustedContactUserIds = await this.getTrustedContactUserIds(userId);
        const payload = {
            alertId: newAlert._id,
            user: {
                _id: userId,
                name: user ? `${user.firstName} ${user.lastName}` : "User",
                phoneNumber: user?.phoneNumber,
                profilePicture: user?.profilePicture,
            },
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address,
            triggeredAt: newAlert.triggeredAt,
        };

        // Create notifications for trusted contacts
        for (const targetId of trustedContactUserIds) {
            const notif = await NotificationModel.create({
                userId: new mongoose.Types.ObjectId(targetId),
                senderId: new mongoose.Types.ObjectId(userId),
                title: "EMERGENCY SOS ALERT!",
                message: `${user?.firstName || "A contact"} has triggered an emergency SOS alert at your location.`,
                type: "alert_triggered",
                metadata: { alertId: newAlert._id, latitude: data.latitude, longitude: data.longitude },
            });

            socketService.emitToUser(targetId, "notification:new", notif);
            socketService.emitToUser(targetId, "sos:trigger", payload);
        }

        // Broadcast for Safety Map temporary emergency markers
        socketService.broadcast("sos:trigger", payload);

        return newAlert;
    }

    async updateAlertLocation(userId: string, alertId: string, latitude: number, longitude: number, accuracy?: number) {
        const alert = await AlertModel.findOne({
            _id: new mongoose.Types.ObjectId(alertId),
            userId: new mongoose.Types.ObjectId(userId),
            status: "active",
        });

        if (!alert) {
            throw new HttpException(404, "Active alert not found");
        }

        alert.latitude = latitude;
        alert.longitude = longitude;
        await alert.save();

        const trustedContactUserIds = await this.getTrustedContactUserIds(userId);
        const updatePayload = {
            alertId: alert._id,
            userId,
            latitude,
            longitude,
            accuracy,
            updatedAt: new Date(),
        };

        for (const targetId of trustedContactUserIds) {
            socketService.emitToUser(targetId, "sos:update", updatePayload);
            socketService.emitToUser(targetId, "location:update", updatePayload);
        }

        socketService.broadcast("location:update", updatePayload);

        return alert;
    }

    async resolveAlert(userId: string, alertId: string) {
        const alert = await AlertModel.findOne({
            _id: new mongoose.Types.ObjectId(alertId),
            userId: new mongoose.Types.ObjectId(userId),
        });

        if (!alert) {
            throw new HttpException(404, "Alert not found");
        }

        if (alert.status === "resolved") {
            return alert;
        }

        alert.status = "resolved";
        alert.resolvedAt = new Date();
        await alert.save();

        const user = await UserModel.findById(userId);
        const trustedContactUserIds = await this.getTrustedContactUserIds(userId);
        const resolvePayload = {
            alertId: alert._id,
            userId,
            resolvedAt: alert.resolvedAt,
        };

        for (const targetId of trustedContactUserIds) {
            const notif = await NotificationModel.create({
                userId: new mongoose.Types.ObjectId(targetId),
                senderId: new mongoose.Types.ObjectId(userId),
                title: "SOS Alert Resolved",
                message: `${user?.firstName || "Contact"} has marked their SOS alert as resolved.`,
                type: "alert_resolved",
                metadata: { alertId: alert._id },
            });

            socketService.emitToUser(targetId, "notification:new", notif);
            socketService.emitToUser(targetId, "sos:resolved", resolvePayload);
        }

        socketService.broadcast("sos:resolved", resolvePayload);

        return alert;
    }
}

