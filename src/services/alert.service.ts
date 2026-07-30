import { AlertModel } from "../models/alert.model";
import { TriggerAlertDTOType } from "../dtos/alert.dto";
import { HttpException } from "../exceptions/http-exception";
import mongoose from "mongoose";

export class AlertService {
    async getActiveAlertForUser(userId: string) {
        return await AlertModel.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            status: "active",
        });
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


    async triggerAlert(userId: string, data: TriggerAlertDTOType) {
        // Check if the authenticated user already has an ACTIVE alert
        const activeAlert = await this.getActiveAlertForUser(userId);
        
        if (activeAlert) {
            // Return it instead of creating another
            return activeAlert;
        }

        const newAlert = new AlertModel({
            userId: new mongoose.Types.ObjectId(userId),
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address,
            status: "active",
            triggeredAt: new Date(),
        });

        await newAlert.save();
        return newAlert;
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
            throw new HttpException(400, "Alert is already resolved");
        }

        alert.status = "resolved";
        alert.resolvedAt = new Date();
        await alert.save();

        return alert;
    }
}
