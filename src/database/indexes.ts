import mongoose from "mongoose";
import { UserModel } from "../models/user.model";
import { ContactModel } from "../models/contact.model";
import { AlertModel } from "../models/alert.model";
import { IncidentModel } from "../models/incident.model";
import { NotificationModel } from "../models/notification.model";
import { ActivityModel } from "../models/activity.model";
import { SafetyCircleModel } from "../models/safetyCircle.model";
import { RefreshTokenModel } from "../models/refreshToken.model";
import { VerificationTokenModel } from "../models/verificationToken.model";
import { DeviceModel } from "../models/device.model";

export const createIndexes = async () => {
    try {
        console.log("Creating MongoDB indexes...");

        // User indexes
        try {
            await UserModel.createIndexes();
            console.log("User indexes created");
        } catch (error: any) {
            if (error.code === 85) {
                console.log("User indexes already exist, skipping");
            } else {
                throw error;
            }
        }

        // Contact indexes
        try {
            await ContactModel.createIndexes();
            console.log("Contact indexes created");
        } catch (error: any) {
            if (error.code === 85) {
                console.log("Contact indexes already exist, skipping");
            } else {
                throw error;
            }
        }

        // Alert indexes
        try {
            await AlertModel.createIndexes();
            console.log("Alert indexes created");
        } catch (error: any) {
            if (error.code === 85) {
                console.log("Alert indexes already exist, skipping");
            } else {
                throw error;
            }
        }

        // Incident indexes (including 2dsphere for geospatial queries)
        try {
            await IncidentModel.createIndexes();
            console.log("Incident indexes created");
        } catch (error: any) {
            if (error.code === 85) {
                console.log("Incident indexes already exist, skipping");
            } else {
                throw error;
            }
        }

        // Notification indexes
        try {
            await NotificationModel.createIndexes();
            console.log("Notification indexes created");
        } catch (error: any) {
            if (error.code === 85) {
                console.log("Notification indexes already exist, skipping");
            } else {
                throw error;
            }
        }

        // Activity indexes
        try {
            await ActivityModel.createIndexes();
            console.log("Activity indexes created");
        } catch (error: any) {
            if (error.code === 85) {
                console.log("Activity indexes already exist, skipping");
            } else {
                throw error;
            }
        }

        // Safety Circle indexes
        try {
            await SafetyCircleModel.createIndexes();
            console.log("Safety Circle indexes created");
        } catch (error: any) {
            if (error.code === 85) {
                console.log("Safety Circle indexes already exist, skipping");
            } else {
                throw error;
            }
        }

        // Refresh Token indexes
        try {
            await RefreshTokenModel.createIndexes();
            console.log("Refresh Token indexes created");
        } catch (error: any) {
            if (error.code === 85) {
                console.log("Refresh Token indexes already exist, skipping");
            } else {
                throw error;
            }
        }

        // Verification Token indexes
        try {
            await VerificationTokenModel.createIndexes();
            console.log("Verification Token indexes created");
        } catch (error: any) {
            if (error.code === 85) {
                console.log("Verification Token indexes already exist, skipping");
            } else {
                throw error;
            }
        }

        // Device indexes
        try {
            await DeviceModel.createIndexes();
            console.log("Device indexes created");
        } catch (error: any) {
            if (error.code === 85) {
                console.log("Device indexes already exist, skipping");
            } else {
                throw error;
            }
        }

        console.log("All MongoDB indexes created successfully");
    } catch (error: any) {
        console.error("Error creating MongoDB indexes:", error.message);
        // Don't throw error - allow server to start even if index creation fails
        console.log("Server will continue without index creation");
    }
};
