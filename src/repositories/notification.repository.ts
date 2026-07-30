import { NotificationModel, INotification } from "../models/notification.model";

export interface INotificationRepository {
    getAll(): Promise<INotification[]>;
    getAllPaginated(page: number, limit: number, filters?: any): Promise<{ notifications: INotification[]; total: number }>;
    getById(id: string): Promise<INotification | null>;
    getByUserId(userId: string): Promise<INotification[]>;
    getUnreadByUserId(userId: string): Promise<INotification[]>;
    create(notification: Partial<INotification>): Promise<INotification>;
    markAsRead(id: string): Promise<INotification | null>;
    markAllAsRead(userId: string): Promise<number>;
    delete(id: string): Promise<boolean>;
    getUnreadCount(userId: string): Promise<number>;
}

export class NotificationMongoRepository implements INotificationRepository {
    async getAll(): Promise<INotification[]> {
        return NotificationModel.find().sort({ createdAt: -1 });
    }

    async getAllPaginated(page: number, limit: number, filters?: any): Promise<{ notifications: INotification[]; total: number }> {
        const skip = (page - 1) * limit;
        let query = NotificationModel.find();

        if (filters) {
            if (filters.userId) {
                query = query.where('userId').equals(filters.userId);
            }
            if (filters.type) {
                query = query.where('type').equals(filters.type);
            }
            if (filters.read !== undefined) {
                query = query.where('read').equals(filters.read);
            }
            if (filters.startDate && filters.endDate) {
                query = query.where('createdAt').gte(new Date(filters.startDate) as any).lte(new Date(filters.endDate) as any);
            }
        }

        const notifications = await query.skip(skip).limit(limit).sort({ createdAt: -1 });
        const total = await NotificationModel.countDocuments(filters || {});
        
        return { notifications, total };
    }

    async getById(id: string): Promise<INotification | null> {
        return NotificationModel.findById(id);
    }

    async getByUserId(userId: string): Promise<INotification[]> {
        return NotificationModel.find({ userId }).sort({ createdAt: -1 });
    }

    async getUnreadByUserId(userId: string): Promise<INotification[]> {
        return NotificationModel.find({ userId, read: false }).sort({ createdAt: -1 });
    }

    async create(notification: Partial<INotification>): Promise<INotification> {
        return NotificationModel.create(notification);
    }

    async markAsRead(id: string): Promise<INotification | null> {
        return NotificationModel.findByIdAndUpdate(id, { read: true }, { returnDocument: 'after' });
    }

    async markAllAsRead(userId: string): Promise<number> {
        const result = await NotificationModel.updateMany({ userId, read: false }, { read: true });
        return result.modifiedCount;
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await NotificationModel.findByIdAndDelete(id);
        return !!deleted;
    }

    async getUnreadCount(userId: string): Promise<number> {
        return NotificationModel.countDocuments({ userId, read: false });
    }
}
