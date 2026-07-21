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
    async getUserNotifications(userId: string, limit: number = 50): Promise<INotification[]> {
        const notifications = await NotificationModel.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit);
        return notifications;
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
