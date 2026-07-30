import { NotificationModel, INotification, NotificationType } from "../models/notification.model";

export class NotificationService {
    /**
     * Create a notification for a user
     */
    async createNotification(userId: string, type: NotificationType, title: string, message: string): Promise<INotification> {
        const notification = await NotificationModel.create({
            userId,
            type,
            title,
            message,
        });
        return notification;
    }

    /**
     * Get all notifications for a user
     */
    async getUserNotifications(userId: string, page: number = 1, limit: number = 10): Promise<{ data: INotification[], meta: { page: number, limit: number, total: number, totalPages: number } }> {
        const skip = (page - 1) * limit;
        const total = await NotificationModel.countDocuments({ userId });
        const totalPages = Math.ceil(total / limit);

        const data = await NotificationModel.find({ userId })
            .sort({ createdAt: -1 })
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

    /**
     * Get unread notifications count for a user
     */
    async getUnreadCount(userId: string): Promise<number> {
        const count = await NotificationModel.countDocuments({ userId, read: false });
        return count;
    }

    /**
     * Mark notifications as read
     */
    async markAsRead(userId: string, notificationIds: string[]): Promise<void> {
        await NotificationModel.updateMany(
            { _id: { $in: notificationIds }, userId },
            { read: true }
        );
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<void> {
        await NotificationModel.updateMany({ userId, read: false }, { read: true });
    }

    /**
     * Delete a notification
     */
    async deleteNotification(userId: string, notificationId: string): Promise<void> {
        await NotificationModel.deleteOne({ _id: notificationId, userId });
    }
}
