import { Request, Response } from "express";
import { SafetyCircleService } from "../services/safetyCircle.service";
import { ActivityService } from "../services/activity.service";
import { PushNotificationService } from "../services/pushNotification.service";
import { ContactService } from "../services/contact.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

const safetyCircleService = new SafetyCircleService();
const activityService = new ActivityService();
const pushNotificationService = new PushNotificationService();
const contactService = new ContactService();

export class SafetyCircleController {
    async addToSafetyCircle(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const { contactId } = req.body;
            if (!contactId) {
                return ApiResponseHelper.error(res, "Contact ID is required", 400);
            }

            const safetyCircle = await safetyCircleService.addToSafetyCircle(
                String(req.user._id),
                contactId
            );

            // Get contact details for notification
            const contact = await contactService.getContactById(String(req.user._id), contactId);
            const memberName = contact ? contact.name : "Unknown";

            // Send push notification
            await pushNotificationService.sendSafetyCircleNotification(
                String(req.user._id),
                contactId,
                "added",
                memberName
            );

            // Log safety circle addition activity
            await activityService.createActivity(
                String(req.user._id),
                "settings_updated",
                "Contact added to safety circle successfully",
                { circleId: safetyCircle._id, contactId },
                req.ip,
                req.headers["user-agent"]
            );

            return ApiResponseHelper.success(res, safetyCircle, "Contact added to safety circle successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async getSafetyCircle(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const safetyCircle = await safetyCircleService.getSafetyCircle(String(req.user._id));

            return ApiResponseHelper.success(res, safetyCircle, "Safety circle fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async updateStatus(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const { circleId } = req.params;
            const { status } = req.body;

            if (!circleId || Array.isArray(circleId)) {
                return ApiResponseHelper.error(res, "Circle ID is required", 400);
            }
            if (!status) {
                return ApiResponseHelper.error(res, "Status is required", 400);
            }

            const safetyCircle = await safetyCircleService.updateStatus(
                String(req.user._id),
                circleId,
                status
            );

            if (!safetyCircle) {
                return ApiResponseHelper.error(res, "Safety circle member not found", 404);
            }

            // Log status update activity
            await activityService.createActivity(
                String(req.user._id),
                "settings_updated",
                "Safety circle status updated successfully",
                { circleId, status },
                req.ip,
                req.headers["user-agent"]
            );

            return ApiResponseHelper.success(res, safetyCircle, "Status updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async updateLocation(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const { circleId } = req.params;
            const { latitude, longitude } = req.body;

            if (!circleId || Array.isArray(circleId)) {
                return ApiResponseHelper.error(res, "Circle ID is required", 400);
            }
            if (latitude === undefined || longitude === undefined) {
                return ApiResponseHelper.error(res, "Latitude and longitude are required", 400);
            }

            const safetyCircle = await safetyCircleService.updateLocation(
                String(req.user._id),
                circleId,
                Number(latitude),
                Number(longitude)
            );

            if (!safetyCircle) {
                return ApiResponseHelper.error(res, "Safety circle member not found", 404);
            }

            // Log location update activity
            await activityService.createActivity(
                String(req.user._id),
                "settings_updated",
                "Safety circle location updated successfully",
                { circleId, latitude, longitude },
                req.ip,
                req.headers["user-agent"]
            );

            return ApiResponseHelper.success(res, safetyCircle, "Location updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async removeFromSafetyCircle(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const { circleId } = req.params;
            if (!circleId || Array.isArray(circleId)) {
                return ApiResponseHelper.error(res, "Circle ID is required", 400);
            }

            // Get safety circle member details before removal
            const safetyCircleMember = await safetyCircleService.getSafetyCircleMember(String(req.user._id), circleId);
            
            await safetyCircleService.removeFromSafetyCircle(String(req.user._id), circleId);

            // Send push notification if contact details were available
            if (safetyCircleMember && safetyCircleMember.contactId) {
                const contact = await contactService.getContactById(String(req.user._id), safetyCircleMember.contactId.toString());
                const memberName = contact ? contact.name : "Unknown";
                
                await pushNotificationService.sendSafetyCircleNotification(
                    String(req.user._id),
                    safetyCircleMember.contactId.toString(),
                    "removed",
                    memberName
                );
            }

            // Log safety circle removal activity
            await activityService.createActivity(
                String(req.user._id),
                "settings_updated",
                "Contact removed from safety circle successfully",
                { circleId },
                req.ip,
                req.headers["user-agent"]
            );

            return ApiResponseHelper.success(res, null, "Contact removed from safety circle successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }
}
