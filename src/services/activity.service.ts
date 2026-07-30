import { ActivityModel, IActivity, ActivityType } from "../models/activity.model";

export class ActivityService {
    /**
     * Create an activity log entry
     */
    async createActivity(
        userId: string,
        type: ActivityType,
        description: string,
        metadata?: Record<string, any>,
        ipAddress?: string,
        userAgent?: string
    ): Promise<IActivity> {
        const activity = await ActivityModel.create({
            userId,
            type,
            description,
            metadata,
            ipAddress,
            userAgent,
        });
        return activity;
    }

    /**
     * Get all activities for a user
     */
    async getUserActivities(userId: string, page: number = 1, limit: number = 10): Promise<{ data: IActivity[], meta: { page: number, limit: number, total: number, totalPages: number } }> {
        const skip = (page - 1) * limit;
        const total = await ActivityModel.countDocuments({ userId });
        const totalPages = Math.ceil(total / limit);

        const data = await ActivityModel.find({ userId })
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
     * Get activities by type for a user
     */
    async getActivitiesByType(userId: string, type: ActivityType, limit: number = 50): Promise<IActivity[]> {
        const activities = await ActivityModel.find({ userId, type })
            .sort({ createdAt: -1 })
            .limit(limit);
        return activities;
    }

    /**
     * Get activities within a date range for a user
     */
    async getActivitiesByDateRange(
        userId: string,
        startDate: Date,
        endDate: Date,
        limit: number = 100
    ): Promise<IActivity[]> {
        const activities = await ActivityModel.find({
            userId,
            createdAt: { $gte: startDate, $lte: endDate },
        })
            .sort({ createdAt: -1 })
            .limit(limit);
        return activities;
    }

    /**
     * Delete old activities (cleanup)
     */
    async deleteOldActivities(daysToKeep: number = 90): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const result = await ActivityModel.deleteMany({
            createdAt: { $lt: cutoffDate },
        });
        return result.deletedCount || 0;
    }
}
