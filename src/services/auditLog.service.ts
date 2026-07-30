import { IAuditLog } from "../models/auditLog.model";
import { AuditLogMongoRepository } from "../repositories/auditLog.repository";
import { HttpException } from "../exceptions/http-exception";

const auditLogRepository = new AuditLogMongoRepository();

export interface PaginatedAuditLogsResult {
    data: IAuditLog[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export class AuditLogService {
    async getAuditLogs(page: number, limit: number, filters?: any): Promise<PaginatedAuditLogsResult> {
        const { auditLogs, total } = await auditLogRepository.getAllPaginated(page, limit, filters);
        return {
            data: auditLogs,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getAuditLogById(id: string): Promise<IAuditLog> {
        if (!id) {
            throw new HttpException(400, "Invalid audit log ID");
        }
        const auditLog = await auditLogRepository.getById(id);
        if (!auditLog) {
            throw new HttpException(404, "Audit log not found");
        }
        return auditLog;
    }

    async createAuditLog(auditLog: Partial<IAuditLog>): Promise<IAuditLog> {
        return await auditLogRepository.create(auditLog);
    }

    async getStats(): Promise<{ total: number; today: number; thisWeek: number; thisMonth: number }> {
        return await auditLogRepository.getStats();
    }
}
