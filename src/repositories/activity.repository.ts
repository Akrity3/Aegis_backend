import { ActivityModel, IActivity } from "../models/activity.model";

export interface IActivityRepository {
    getAll(): Promise<IActivity[]>;
    getAllPaginated(page: number, limit: number, filters?: any): Promise<{ activities: IActivity[]; total: number }>;
    getById(id: string): Promise<IActivity | null>;
    create(activity: Partial<IActivity>): Promise<IActivity>;
    getByUserId(userId: string): Promise<IActivity[]>;
    getByType(type: string): Promise<IActivity[]>;
    getByDateRange(startDate: Date, endDate: Date): Promise<IActivity[]>;
    getStats(): Promise<{ total: number; today: number; thisWeek: number; thisMonth: number }>;
}

export class ActivityMongoRepository implements IActivityRepository {
    async getAll(): Promise<IActivity[]> {
        return ActivityModel.find().sort({ createdAt: -1 });
    }

    async getAllPaginated(page: number, limit: number, filters?: any): Promise<{ activities: IActivity[]; total: number }> {
        const skip = (page - 1) * limit;
        let query = ActivityModel.find();

        if (filters) {
            if (filters.type) {
                query = query.where('type').equals(filters.type);
            }
            if (filters.userId) {
                query = query.where('userId').equals(filters.userId);
            }
            if (filters.startDate && filters.endDate) {
                query = query.where('createdAt').gte(new Date(filters.startDate) as any).lte(new Date(filters.endDate) as any);
            }
        }

        const activities = await query.skip(skip).limit(limit).sort({ createdAt: -1 });
        const total = await ActivityModel.countDocuments(filters || {});
        
        return { activities, total };
    }

    async getById(id: string): Promise<IActivity | null> {
        return ActivityModel.findById(id);
    }

    async create(activity: Partial<IActivity>): Promise<IActivity> {
        return ActivityModel.create(activity);
    }

    async getByUserId(userId: string): Promise<IActivity[]> {
        return ActivityModel.find({ userId }).sort({ createdAt: -1 });
    }

    async getByType(type: string): Promise<IActivity[]> {
        return ActivityModel.find({ type: type as any }).sort({ createdAt: -1 });
    }

    async getByDateRange(startDate: Date, endDate: Date): Promise<IActivity[]> {
        return ActivityModel.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).sort({ createdAt: -1 });
    }

    async getStats(): Promise<{ total: number; today: number; thisWeek: number; thisMonth: number }> {
        const total = await ActivityModel.countDocuments();
        
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - 7);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const today = await ActivityModel.countDocuments({ createdAt: { $gte: todayStart } });
        const thisWeek = await ActivityModel.countDocuments({ createdAt: { $gte: weekStart } });
        const thisMonth = await ActivityModel.countDocuments({ createdAt: { $gte: monthStart } });

        return { total, today, thisWeek, thisMonth };
    }
}
