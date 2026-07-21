import { Request, Response } from "express";
import { ActivityService } from "../services/activity.service";
import { ACTIVITY_TYPES } from "../models/activity.model";

const activityService = new ActivityService();

export class ActivityController {
    async getActivities(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
            }

            const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
            const activities = await activityService.getUserActivities(
                String(req.user._id),
                limit
            );

            return res.status(200).json({
                success: true,
                message: "Activities fetched successfully.",
                data: activities,
            });
        } catch (error: any) {
            return res
                .status(error.status || error.statusCode || 500)
                .json({ message: error.message || "Internal Server Error" });
        }
    }

    async getActivitiesByType(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
            }

            const { type } = req.params;
            if (!type || Array.isArray(type)) {
                return res.status(400).json({ message: "Activity type is required" });
            }

            if (!ACTIVITY_TYPES.includes(type as any)) {
                return res.status(400).json({ message: "Invalid activity type" });
            }

            const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
            const activities = await activityService.getActivitiesByType(
                String(req.user._id),
                type as any,
                limit
            );

            return res.status(200).json({
                success: true,
                message: "Activities fetched successfully.",
                data: activities,
            });
        } catch (error: any) {
            return res
                .status(error.status || error.statusCode || 500)
                .json({ message: error.message || "Internal Server Error" });
        }
    }

    async getActivitiesByDateRange(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
            }

            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({ message: "Start date and end date are required" });
            }

            const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
            const activities = await activityService.getActivitiesByDateRange(
                String(req.user._id),
                new Date(startDate as string),
                new Date(endDate as string),
                limit
            );

            return res.status(200).json({
                success: true,
                message: "Activities fetched successfully.",
                data: activities,
            });
        } catch (error: any) {
            return res
                .status(error.status || error.statusCode || 500)
                .json({ message: error.message || "Internal Server Error" });
        }
    }
}
