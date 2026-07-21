import { Request, Response } from "express";
import { z } from "zod";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/admin.dto";
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
}
