import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";

const notificationService = new NotificationService();

export class NotificationController {
    async getNotifications(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
            }

            const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
            const notifications = await notificationService.getUserNotifications(
                String(req.user._id),
                limit
            );

            return res.status(200).json({
                success: true,
                message: "Notifications fetched successfully.",
                data: notifications,
            });
        } catch (error: any) {
            return res
                .status(error.status || error.statusCode || 500)
                .json({ message: error.message || "Internal Server Error" });
        }
    }

    async getUnreadCount(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
            }

            const count = await notificationService.getUnreadCount(String(req.user._id));

            return res.status(200).json({
                success: true,
                message: "Unread count fetched successfully.",
                data: { count },
            });
        } catch (error: any) {
            return res
                .status(error.status || error.statusCode || 500)
                .json({ message: error.message || "Internal Server Error" });
        }
    }

    async markAsRead(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
            }

            const { notificationIds } = req.body;
            if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
                return res.status(400).json({ message: "Invalid notification IDs" });
            }

            await notificationService.markAsRead(String(req.user._id), notificationIds);

            return res.status(200).json({
                success: true,
                message: "Notifications marked as read successfully.",
            });
        } catch (error: any) {
            return res
                .status(error.status || error.statusCode || 500)
                .json({ message: error.message || "Internal Server Error" });
        }
    }

    async markAllAsRead(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
            }

            await notificationService.markAllAsRead(String(req.user._id));

            return res.status(200).json({
                success: true,
                message: "All notifications marked as read successfully.",
            });
        } catch (error: any) {
            return res
                .status(error.status || error.statusCode || 500)
                .json({ message: error.message || "Internal Server Error" });
        }
    }

    async deleteNotification(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
            }

            const { notificationId } = req.params;
            if (!notificationId || Array.isArray(notificationId)) {
                return res.status(400).json({ message: "Notification ID is required" });
            }

            await notificationService.deleteNotification(String(req.user._id), notificationId);

            return res.status(200).json({
                success: true,
                message: "Notification deleted successfully.",
            });
        } catch (error: any) {
            return res
                .status(error.status || error.statusCode || 500)
                .json({ message: error.message || "Internal Server Error" });
        }
    }
}
