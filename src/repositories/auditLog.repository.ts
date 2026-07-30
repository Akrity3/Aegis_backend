import { AuditLogModel, IAuditLog } from "../models/auditLog.model";

export interface IAuditLogRepository {
    getAll(): Promise<IAuditLog[]>;
    getAllPaginated(page: number, limit: number, filters?: any): Promise<{ auditLogs: IAuditLog[]; total: number }>;
    getById(id: string): Promise<IAuditLog | null>;
    getByAdminId(adminId: string): Promise<IAuditLog[]>;
    getByAction(action: string): Promise<IAuditLog[]>;
    create(auditLog: Partial<IAuditLog>): Promise<IAuditLog>;
    getByDateRange(startDate: Date, endDate: Date): Promise<IAuditLog[]>;
    getStats(): Promise<{ total: number; today: number; thisWeek: number; thisMonth: number }>;
}

export class AuditLogMongoRepository implements IAuditLogRepository {
    async getAll(): Promise<IAuditLog[]> {
        return AuditLogModel.find().sort({ timestamp: -1 });
    }

    async getAllPaginated(page: number, limit: number, filters?: any): Promise<{ auditLogs: IAuditLog[]; total: number }> {
        const skip = (page - 1) * limit;
        let query = AuditLogModel.find();

        if (filters) {
            if (filters.adminId) {
                query = query.where('adminId').equals(filters.adminId);
            }
            if (filters.action) {
                query = query.where('action').equals(filters.action);
            }
            if (filters.targetType) {
                query = query.where('targetType').equals(filters.targetType);
            }
            if (filters.startDate && filters.endDate) {
                query = query.where('timestamp').gte(new Date(filters.startDate) as any).lte(new Date(filters.endDate) as any);
            }
        }

        const auditLogs = await query.skip(skip).limit(limit).sort({ timestamp: -1 });
        const total = await AuditLogModel.countDocuments(filters || {});
        
        return { auditLogs, total };
    }

    async getById(id: string): Promise<IAuditLog | null> {
        return AuditLogModel.findById(id);
    }

    async getByAdminId(adminId: string): Promise<IAuditLog[]> {
        return AuditLogModel.find({ adminId }).sort({ timestamp: -1 });
    }

    async create(auditLog: Partial<IAuditLog>): Promise<IAuditLog> {
        return AuditLogModel.create(auditLog);
    }

    async getByAction(action: string): Promise<IAuditLog[]> {
        return AuditLogModel.find({ action: action as any }).sort({ timestamp: -1 });
    }

    async getByDateRange(startDate: Date, endDate: Date): Promise<IAuditLog[]> {
        return AuditLogModel.find({
            timestamp: { $gte: startDate, $lte: endDate }
        }).sort({ timestamp: -1 });
    }

    async getStats(): Promise<{ total: number; today: number; thisWeek: number; thisMonth: number }> {
        const total = await AuditLogModel.countDocuments();
        
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - 7);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const today = await AuditLogModel.countDocuments({ timestamp: { $gte: todayStart } });
        const thisWeek = await AuditLogModel.countDocuments({ timestamp: { $gte: weekStart } });
        const thisMonth = await AuditLogModel.countDocuments({ timestamp: { $gte: monthStart } });

        return { total, today, thisWeek, thisMonth };
    }
}
