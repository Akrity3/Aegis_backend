import { Request, Response } from "express";
import { z } from "zod";
import { AdminCreateUserDTO, AdminUpdateUserDTO, AdminUpdateIncidentDTO } from "../dtos/admin.dto";
import { AdminService } from "../services/admin.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

const adminService = new AdminService();

export class AdminController {
    // GET /api/v1/admin/users
    async getUsers(req: Request, res: Response) {
        try {
            const page  = Math.max(1, parseInt(String(req.query.page  ?? 1),  10) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? 10), 10) || 10));
            const search = req.query.search ? String(req.query.search) : undefined;

            const result = await adminService.getUsers(page, limit, search);

            return ApiResponseHelper.success(
                res,
                result.data,
                "Users fetched successfully",
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

    // GET /api/v1/admin/users/:id
    async getUserById(req: Request, res: Response) {
        try {
            const user = await adminService.getUserById(String(req.params.id));
            return ApiResponseHelper.success(res, user, "User fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || error.statusCode || 500
            );
        }
    }

    // POST /api/v1/admin/users
    async createUser(req: Request, res: Response) {
        try {
            const parsed = AdminCreateUserDTO.safeParse(req.body);
            if (!parsed.success) {
                const message = parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', ');
                return ApiResponseHelper.error(res, message, 400);
            }

            const user = await adminService.createUser(parsed.data);
            const userObj = user.toObject();
            delete userObj.password;

            return ApiResponseHelper.success(
                res,
                userObj,
                "User created successfully",
                201
            );
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || error.statusCode || 500
            );
        }
    }

    // PATCH /api/v1/admin/users/:id
    async updateUser(req: Request, res: Response) {
        try {
            const parsed = AdminUpdateUserDTO.safeParse(req.body);
            if (!parsed.success) {
                const message = parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', ');
                return ApiResponseHelper.error(res, message, 400);
            }

            const user = await adminService.updateUser(
                String(req.params.id),
                parsed.data
            );

            const userObj = user.toObject();
            delete userObj.password;

            return ApiResponseHelper.success(
                res,
                userObj,
                "User updated successfully"
            );
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || error.statusCode || 500
            );
        }
    }

    // DELETE /api/v1/admin/users/:id
    async deleteUser(req: Request, res: Response) {
        try {
            await adminService.deleteUser(String(req.params.id));
            return ApiResponseHelper.success(
                res,
                null,
                "User deleted successfully"
            );
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || error.statusCode || 500
            );
        }
    }

    // GET /api/v1/admin/stats
    async getStats(req: Request, res: Response) {
        try {
            const stats = await adminService.getStats();
            return ApiResponseHelper.success(res, stats, "Statistics fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || error.statusCode || 500
            );
        }
    }

    // GET /api/v1/admin/dashboard
    async getDashboard(req: Request, res: Response) {
        try {
            const stats = await adminService.getDashboardStats();
            return ApiResponseHelper.success(res, stats, "Dashboard data fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || error.statusCode || 500
            );
        }
    }

    // GET /api/v1/admin/incidents
    async getIncidents(req: Request, res: Response) {
        try {
            const page = Math.max(1, parseInt(String(req.query.page ?? 1), 10) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? 10), 10) || 10));
            
            const filters: any = {};
            if (req.query.status) filters.status = req.query.status;
            if (req.query.category) filters.category = req.query.category;
            if (req.query.search) filters.search = req.query.search;
            if (req.query.startDate && req.query.endDate) {
                filters.startDate = req.query.startDate;
                filters.endDate = req.query.endDate;
            }

            const result = await adminService.getIncidents(page, limit, filters);

            return ApiResponseHelper.success(
                res,
                result.data,
                "Incidents fetched successfully",
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

    // GET /api/v1/admin/incidents/:id
    async getIncidentById(req: Request, res: Response) {
        try {
            const incident = await adminService.getIncidentById(String(req.params.id));
            return ApiResponseHelper.success(res, incident, "Incident fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || error.statusCode || 500
            );
        }
    }

    // PATCH /api/v1/admin/incidents/:id
    async updateIncident(req: Request, res: Response) {
        try {
            const parsed = AdminUpdateIncidentDTO.safeParse(req.body);
            if (!parsed.success) {
                const message = parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', ');
                return ApiResponseHelper.error(res, message, 400);
            }

            const incident = await adminService.updateIncident(String(req.params.id), parsed.data);
            return ApiResponseHelper.success(res, incident, "Incident updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || error.statusCode || 500
            );
        }
    }

    // DELETE /api/v1/admin/incidents/:id
    async deleteIncident(req: Request, res: Response) {
        try {
            await adminService.deleteIncident(String(req.params.id));
            return ApiResponseHelper.success(res, null, "Incident deleted successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || error.statusCode || 500
            );
        }
    }

    // GET /api/v1/admin/alerts
    async getAlerts(req: Request, res: Response) {
        try {
            const page = Math.max(1, parseInt(String(req.query.page ?? 1), 10) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? 10), 10) || 10));
            
            const filters: any = {};
            if (req.query.status) filters.status = req.query.status;
            if (req.query.search) filters.search = req.query.search;
            if (req.query.startDate && req.query.endDate) {
                filters.startDate = req.query.startDate;
                filters.endDate = req.query.endDate;
            }

            const result = await adminService.getAlerts(page, limit, filters);

            return ApiResponseHelper.success(
                res,
                result.data,
                "Alerts fetched successfully",
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

    // GET /api/v1/admin/alerts/:id
    async getAlertById(req: Request, res: Response) {
        try {
            const alert = await adminService.getAlertById(String(req.params.id));
            return ApiResponseHelper.success(res, alert, "Alert fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || error.statusCode || 500
            );
        }
    }

    // PATCH /api/v1/admin/alerts/:id/resolve
    async resolveAlert(req: Request, res: Response) {
        try {
            const alert = await adminService.resolveAlert(String(req.params.id));
            return ApiResponseHelper.success(res, alert, "Alert resolved successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || error.statusCode || 500
            );
        }
    }

    // GET /api/v1/admin/activities
    async getActivities(req: Request, res: Response) {
        try {
            const page = Math.max(1, parseInt(String(req.query.page ?? 1), 10) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? 10), 10) || 10));
            
            const filters: any = {};
            if (req.query.type) filters.type = req.query.type;
            if (req.query.userId) filters.userId = req.query.userId;
            if (req.query.startDate && req.query.endDate) {
                filters.startDate = req.query.startDate;
                filters.endDate = req.query.endDate;
            }

            const result = await adminService.getActivities(page, limit, filters);

            return ApiResponseHelper.success(
                res,
                result.data,
                "Activities fetched successfully",
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

    // GET /api/v1/admin/analytics
    async getAnalytics(req: Request, res: Response) {
        try {
            const analytics = await adminService.getAnalytics();
            return ApiResponseHelper.success(res, analytics, "Analytics data fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || error.statusCode || 500
            );
        }
    }
}
