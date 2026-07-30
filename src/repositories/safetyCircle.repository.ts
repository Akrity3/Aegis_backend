import { SafetyCircleModel, ISafetyCircle } from "../models/safetyCircle.model";

export interface ISafetyCircleRepository {
    getAll(): Promise<ISafetyCircle[]>;
    getAllPaginated(page: number, limit: number, filters?: any): Promise<{ safetyCircles: ISafetyCircle[]; total: number }>;
    getById(id: string): Promise<ISafetyCircle | null>;
    getByUserId(userId: string): Promise<ISafetyCircle[]>;
    create(safetyCircle: Partial<ISafetyCircle>): Promise<ISafetyCircle>;
    update(id: string, safetyCircle: Partial<ISafetyCircle>): Promise<ISafetyCircle | null>;
    delete(id: string): Promise<boolean>;
    getByContactId(contactId: string): Promise<ISafetyCircle[]>;
    getStats(): Promise<{ total: number; active: number; inactive: number; pending: number }>;
}

export class SafetyCircleMongoRepository implements ISafetyCircleRepository {
    async getAll(): Promise<ISafetyCircle[]> {
        return SafetyCircleModel.find().sort({ createdAt: -1 });
    }

    async getAllPaginated(page: number, limit: number, filters?: any): Promise<{ safetyCircles: ISafetyCircle[]; total: number }> {
        const skip = (page - 1) * limit;
        let query = SafetyCircleModel.find();

        if (filters) {
            if (filters.userId) {
                query = query.where('userId').equals(filters.userId);
            }
            if (filters.contactId) {
                query = query.where('contactId').equals(filters.contactId);
            }
            if (filters.status) {
                query = query.where('status').equals(filters.status);
            }
            if (filters.startDate && filters.endDate) {
                query = query.where('createdAt').gte(new Date(filters.startDate) as any).lte(new Date(filters.endDate) as any);
            }
        }

        const safetyCircles = await query.skip(skip).limit(limit).sort({ createdAt: -1 });
        const total = await SafetyCircleModel.countDocuments(filters || {});
        
        return { safetyCircles, total };
    }

    async getById(id: string): Promise<ISafetyCircle | null> {
        return SafetyCircleModel.findById(id);
    }

    async getByUserId(userId: string): Promise<ISafetyCircle[]> {
        return SafetyCircleModel.find({ userId }).sort({ createdAt: -1 });
    }

    async create(safetyCircle: Partial<ISafetyCircle>): Promise<ISafetyCircle> {
        return SafetyCircleModel.create(safetyCircle);
    }

    async update(id: string, safetyCircle: Partial<ISafetyCircle>): Promise<ISafetyCircle | null> {
        return SafetyCircleModel.findByIdAndUpdate(id, safetyCircle, { returnDocument: 'after' });
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await SafetyCircleModel.findByIdAndDelete(id);
        return !!deleted;
    }

    async getByContactId(contactId: string): Promise<ISafetyCircle[]> {
        return SafetyCircleModel.find({ contactId }).sort({ createdAt: -1 });
    }

    async getStats(): Promise<{ total: number; active: number; inactive: number; pending: number }> {
        const total = await SafetyCircleModel.countDocuments();
        const active = await SafetyCircleModel.countDocuments({ status: 'active' });
        const inactive = await SafetyCircleModel.countDocuments({ status: 'inactive' });
        const pending = await SafetyCircleModel.countDocuments({ status: 'pending' });

        return { total, active, inactive, pending };
    }
}
