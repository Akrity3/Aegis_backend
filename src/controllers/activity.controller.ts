import { Request, Response } from "express";
import { ActivityService } from "../services/activity.service";
import { ACTIVITY_TYPES } from "../models/activity.model";
import { ApiResponseHelper } from "../utils/apihelper.util";

const activityService = new ActivityService();

export class ActivityController {
    async getActivities(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const page = Math.max(1, parseInt(String(req.query.page ?? 1), 10) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? 10), 10) || 10));

            const result = await activityService.getUserActivities(
                String(req.user._id),
                page,
                limit
            );

            return ApiResponseHelper.success(
                res,
                result.data,
                "Activities fetched successfully",
                200,
                result.meta
            );
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async getActivitiesByType(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const { type } = req.params;
            if (!type || Array.isArray(type)) {
                return ApiResponseHelper.error(res, "Activity type is required", 400);
            }

            if (!ACTIVITY_TYPES.includes(type as any)) {
                return ApiResponseHelper.error(res, "Invalid activity type", 400);
            }

            const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
            const activities = await activityService.getActivitiesByType(
                String(req.user._id),
                type as any,
                limit
            );

            return ApiResponseHelper.success(res, activities, "Activities fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async getActivitiesByDateRange(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return ApiResponseHelper.error(res, "Start date and end date are required", 400);
            }

            const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
            const activities = await activityService.getActivitiesByDateRange(
                String(req.user._id),
                new Date(startDate as string),
                new Date(endDate as string),
                limit
            );

            return ApiResponseHelper.success(res, activities, "Activities fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }
}
