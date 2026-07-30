import { AlertModel, IAlert } from "../models/alert.model";

export interface IAlertRepository {
    getAll(): Promise<IAlert[]>;
    getAllPaginated(page: number, limit: number, filters?: any): Promise<{ alerts: IAlert[]; total: number }>;
    getById(id: string): Promise<IAlert | null>;
    create(alert: Partial<IAlert>): Promise<IAlert>;
    update(id: string, alert: Partial<IAlert>): Promise<IAlert | null>;
    delete(id: string): Promise<boolean>;
    getByStatus(status: string): Promise<IAlert[]>;
    getByUserId(userId: string): Promise<IAlert[]>;
    getStats(): Promise<{ total: number; active: number; resolved: number }>;
}

export class AlertMongoRepository implements IAlertRepository {
    async getAll(): Promise<IAlert[]> {
        return AlertModel.find().sort({ triggeredAt: -1 });
    }

    async getAllPaginated(page: number, limit: number, filters?: any): Promise<{ alerts: IAlert[]; total: number }> {
        const skip = (page - 1) * limit;
        let query = AlertModel.find();

        if (filters) {
            if (filters.status) {
                query = query.where('status').equals(filters.status);
            }
            if (filters.search) {
                query = query.where('address').regex(new RegExp(filters.search, 'i'));
            }
            if (filters.startDate && filters.endDate) {
                query = query.where('triggeredAt').gte(new Date(filters.startDate) as any).lte(new Date(filters.endDate) as any);
            }
        }

        const alerts = await query.skip(skip).limit(limit).sort({ triggeredAt: -1 });
        const total = await AlertModel.countDocuments(filters || {});
        
        return { alerts, total };
    }

    async getById(id: string): Promise<IAlert | null> {
        return AlertModel.findById(id);
    }

    async create(alert: Partial<IAlert>): Promise<IAlert> {
        return AlertModel.create(alert);
    }

    async update(id: string, alert: Partial<IAlert>): Promise<IAlert | null> {
        return AlertModel.findByIdAndUpdate(id, alert, { returnDocument: 'after' });
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await AlertModel.findByIdAndDelete(id);
        return !!deleted;
    }

    async getByStatus(status: string): Promise<IAlert[]> {
        return AlertModel.find().where('status').equals(status).sort({ triggeredAt: -1 });
    }

    async getByUserId(userId: string): Promise<IAlert[]> {
        return AlertModel.find({ userId }).sort({ triggeredAt: -1 });
    }

    async getStats(): Promise<{ total: number; active: number; resolved: number }> {
        const total = await AlertModel.countDocuments();
        const active = await AlertModel.countDocuments({ status: 'active' });
        const resolved = await AlertModel.countDocuments({ status: 'resolved' });

        return { total, active, resolved };
    }
}
