import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";
import { ActivityService } from "../services/activity.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

const notificationService = new NotificationService();
const activityService = new ActivityService();

export class NotificationController {
    async getNotifications(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const page = Math.max(1, parseInt(String(req.query.page ?? 1), 10) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? 10), 10) || 10));

            const result = await notificationService.getUserNotifications(
                String(req.user._id),
                page,
                limit
            );

            return ApiResponseHelper.success(
                res,
                result.data,
                "Notifications fetched successfully",
                200,
                result.meta
            );
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async getUnreadCount(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const count = await notificationService.getUnreadCount(String(req.user._id));

            return ApiResponseHelper.success(res, { count }, "Unread count fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async markAsRead(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const { notificationIds } = req.body;
            if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
                return ApiResponseHelper.error(res, "Invalid notification IDs", 400);
            }

            await notificationService.markAsRead(String(req.user._id), notificationIds);

            // Log notification read activity
            await activityService.createActivity(
                String(req.user._id),
                "notification_read",
                "Notifications marked as read",
                { notificationIds },
                req.ip,
                req.headers["user-agent"]
            );

            return ApiResponseHelper.success(res, null, "Notifications marked as read successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async markAllAsRead(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            await notificationService.markAllAsRead(String(req.user._id));

            return ApiResponseHelper.success(res, null, "All notifications marked as read successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async deleteNotification(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const { notificationId } = req.params;
            if (!notificationId || Array.isArray(notificationId)) {
                return ApiResponseHelper.error(res, "Notification ID is required", 400);
            }

            await notificationService.deleteNotification(String(req.user._id), notificationId);

            return ApiResponseHelper.success(res, null, "Notification deleted successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }
}
