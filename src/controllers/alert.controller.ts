import { Request, Response } from "express";
import { TriggerAlertDTO, ResolveAlertDTO } from "../dtos/alert.dto";
import { AlertService } from "../services/alert.service";
import { ActivityService } from "../services/activity.service";
import { PushNotificationService } from "../services/pushNotification.service";
import { SafetyCircleService } from "../services/safetyCircle.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

const alertService = new AlertService();
const activityService = new ActivityService();
const pushNotificationService = new PushNotificationService();
const safetyCircleService = new SafetyCircleService();

export class AlertController {
    async getMyAlerts(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const page = Math.max(1, parseInt(String(req.query.page ?? 1), 10) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? 10), 10) || 10));

            const result = await alertService.getMyAlerts(String(req.user._id), page, limit);

            return ApiResponseHelper.success(
                res,
                result.data,
                "Alerts fetched successfully",
                200,
                result.meta
            );
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async triggerAlert(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const parsedData = TriggerAlertDTO.safeParse(req.body);
            if (!parsedData.success) {
                const message = parsedData.error.issues.map((e: any) => e.message).join(", ");
                return ApiResponseHelper.error(res, message, 400);
            }

            const alert = await alertService.triggerAlert(String(req.user._id), parsedData.data);

            // Log alert triggered activity
            await activityService.createActivity(
                String(req.user._id),
                "alert_triggered",
                "SOS triggered successfully",
                { alertId: alert._id, latitude: alert.latitude, longitude: alert.longitude },
                req.ip,
                req.headers["user-agent"]
            );

            // Send push notifications to safety circle members
            const safetyCircle = await safetyCircleService.getSafetyCircle(String(req.user._id));
            const safetyCircleUserIds = safetyCircle
                .filter((member) => member.contactId && member.status === "active")
                .map((member) => member.contactId.toString());

            if (safetyCircleUserIds.length > 0) {
                await pushNotificationService.sendSOSAlert(
                    String(req.user._id),
                    safetyCircleUserIds,
                    { latitude: alert.latitude, longitude: alert.longitude }
                );
            }

            return ApiResponseHelper.success(res, alert, "SOS triggered successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async getActiveAlert(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const alert = await alertService.getActiveAlertForUser(String(req.user._id));
            return ApiResponseHelper.success(res, alert, "Active alert fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async getAllActiveAlerts(req: Request, res: Response) {
        try {
            const alerts = await alertService.getActiveAlerts();
            return ApiResponseHelper.success(res, alerts, "Active emergency alerts fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async updateLocation(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const { alertId, latitude, longitude, accuracy } = req.body;
            if (!alertId || latitude === undefined || longitude === undefined) {
                return ApiResponseHelper.error(res, "alertId, latitude, and longitude are required", 400);
            }

            const alert = await alertService.updateAlertLocation(
                String(req.user._id),
                String(alertId),
                Number(latitude),
                Number(longitude),
                accuracy ? Number(accuracy) : undefined
            );

            return ApiResponseHelper.success(res, alert, "Location updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async resolveAlert(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const alertId = req.params.id as string;
            
            if (!alertId) {
                return ApiResponseHelper.error(res, "Alert ID is required", 400);
            }

            const alert = await alertService.resolveAlert(String(req.user._id), alertId);

            // Log alert resolved activity
            await activityService.createActivity(
                String(req.user._id),
                "alert_resolved",
                "SOS resolved successfully",
                { alertId },
                req.ip,
                req.headers["user-agent"]
            );

            return ApiResponseHelper.success(res, alert, "SOS resolved successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }
}

