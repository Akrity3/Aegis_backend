import { Request, Response } from "express";
import { SettingsService } from "../services/settings.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

const settingsService = new SettingsService();

export class SettingsController {
    // GET /api/v1/admin/settings
    async getSettings(req: Request, res: Response) {
        try {
            const settings = await settingsService.getSettings();
            return ApiResponseHelper.success(res, settings, "Settings fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || error.statusCode || 500
            );
        }
    }

    // PATCH /api/v1/admin/settings
    async updateSettings(req: Request, res: Response) {
        try {
            const settings = await settingsService.updateSettings(req.body);
            return ApiResponseHelper.success(res, settings, "Settings updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || error.statusCode || 500
            );
        }
    }
}
