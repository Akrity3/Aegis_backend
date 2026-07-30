import { Request, Response } from "express";
import { AuditLogService } from "../services/auditLog.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

const auditLogService = new AuditLogService();

export class AuditLogController {
    // GET /api/v1/admin/audit-logs
    async getAuditLogs(req: Request, res: Response) {
        try {
            const page = Math.max(1, parseInt(String(req.query.page ?? 1), 10) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? 10), 10) || 10));
            
            const filters: any = {};
            if (req.query.adminId) filters.adminId = req.query.adminId;
            if (req.query.action) filters.action = req.query.action;
            if (req.query.targetType) filters.targetType = req.query.targetType;
            if (req.query.startDate && req.query.endDate) {
                filters.startDate = req.query.startDate;
                filters.endDate = req.query.endDate;
            }

            const result = await auditLogService.getAuditLogs(page, limit, filters);

            return ApiResponseHelper.success(
                res,
                result.data,
                "Audit logs fetched successfully",
                200,
                result.meta
            );
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || error.statusCode || 500
            );
        }
    }

    // GET /api/v1/admin/audit-logs/stats
    async getAuditLogStats(req: Request, res: Response) {
        try {
            const stats = await auditLogService.getStats();
            return ApiResponseHelper.success(res, stats, "Audit log statistics fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || error.statusCode || 500
            );
        }
    }
}
