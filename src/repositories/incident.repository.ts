import { IncidentModel, IIncident } from "../models/incident.model";

export interface IIncidentRepository {
    getAll(): Promise<IIncident[]>;
    getAllPaginated(page: number, limit: number, filters?: any): Promise<{ incidents: IIncident[]; total: number }>;
    getById(id: string): Promise<IIncident | null>;
    create(incident: Partial<IIncident>): Promise<IIncident>;
    update(id: string, incident: Partial<IIncident>): Promise<IIncident | null>;
    delete(id: string): Promise<boolean>;
    getByStatus(status: string): Promise<IIncident[]>;
    getByCategory(category: string): Promise<IIncident[]>;
    getByDateRange(startDate: Date, endDate: Date): Promise<IIncident[]>;
    getStats(): Promise<{ total: number; pending: number; verified: number; rejected: number }>;
}

export class IncidentMongoRepository implements IIncidentRepository {
    async getAll(): Promise<IIncident[]> {
        return IncidentModel.find().sort({ reportedAt: -1 });
    }

    async getAllPaginated(page: number, limit: number, filters?: any): Promise<{ incidents: IIncident[]; total: number }> {
        const skip = (page - 1) * limit;
        let query = IncidentModel.find();

        if (filters) {
            if (filters.status) {
                query = query.where('status').equals(filters.status);
            }
            if (filters.category) {
                query = query.where('category').equals(filters.category);
            }
            if (filters.search) {
                query = query.where('description').regex(new RegExp(filters.search, 'i'));
            }
            if (filters.startDate && filters.endDate) {
                query = query.where('reportedAt').gte(new Date(filters.startDate) as any).lte(new Date(filters.endDate) as any);
            }
        }

        const incidents = await query.skip(skip).limit(limit).sort({ reportedAt: -1 });
        const total = await IncidentModel.countDocuments(filters || {});
        
        return { incidents, total };
    }

    async getById(id: string): Promise<IIncident | null> {
        return IncidentModel.findById(id);
    }

    async create(incident: Partial<IIncident>): Promise<IIncident> {
        return IncidentModel.create(incident);
    }

    async update(id: string, incident: Partial<IIncident>): Promise<IIncident | null> {
        return IncidentModel.findByIdAndUpdate(id, incident, { returnDocument: 'after' });
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await IncidentModel.findByIdAndDelete(id);
        return !!deleted;
    }

    async getByStatus(status: string): Promise<IIncident[]> {
        return IncidentModel.find({ status: status as any }).sort({ reportedAt: -1 });
    }

    async getByCategory(category: string): Promise<IIncident[]> {
        return IncidentModel.find({ category: category as any }).sort({ reportedAt: -1 });
    }

    async getByDateRange(startDate: Date, endDate: Date): Promise<IIncident[]> {
        return IncidentModel.find({
            reportedAt: { $gte: startDate, $lte: endDate }
        }).sort({ reportedAt: -1 });
    }

    async getStats(): Promise<{ total: number; pending: number; verified: number; rejected: number }> {
        const total = await IncidentModel.countDocuments();
        const pending = await IncidentModel.countDocuments({ status: 'pending' });
        const verified = await IncidentModel.countDocuments({ status: 'verified' });
        const rejected = await IncidentModel.countDocuments({ status: 'rejected' });

        return { total, pending, verified, rejected };
    }
}
