import { Request, Response } from "express";
import path from "path";
import { CreateIncidentDTO, UpdateIncidentDTO } from "../dtos/incident.dto";
import { IncidentService } from "../services/incident.service";
import { ActivityService } from "../services/activity.service";
import { PushNotificationService } from "../services/pushNotification.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

const incidentService = new IncidentService();
const activityService = new ActivityService();
const pushNotificationService = new PushNotificationService();

export class IncidentController {
    async createIncident(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            // Multipart form-data sends numbers as strings — coerce before validation.
            const body = {
                ...req.body,
                latitude: req.body.latitude !== undefined ? Number(req.body.latitude) : undefined,
                longitude: req.body.longitude !== undefined ? Number(req.body.longitude) : undefined,
            };

            const parsedData = CreateIncidentDTO.safeParse(body);
            if (!parsedData.success) {
                const message = parsedData.error.issues
                    .map((e: any) => e.message)
                    .join(", ");
                return ApiResponseHelper.error(res, message, 400);
            }

            // Build relative URL for the uploaded photo (if present)
            let photoUrl: string | undefined;
            if (req.file) {
                photoUrl = `/uploads/${path.basename(req.file.path)}`;
            }

            const incident = await incidentService.createIncident(
                String(req.user._id),
                parsedData.data,
                photoUrl
            );

            // Log incident reported activity
            await activityService.createActivity(
                String(req.user._id),
                "incident_reported",
                "Incident reported successfully",
                { incidentId: incident._id, category: incident.category, latitude: incident.latitude, longitude: incident.longitude },
                req.ip,
                req.headers["user-agent"]
            );

            // Send push notification about new incident to all users
            // In production, you might want to send only to nearby users based on location
            await pushNotificationService.sendIncidentNotification(
                [String(req.user._id)], // Send to the creator for now, could be expanded to nearby users
                {
                    category: incident.category,
                    description: incident.description,
                    latitude: incident.latitude,
                    longitude: incident.longitude,
                }
            );

            return ApiResponseHelper.success(res, incident, "Incident reported successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async getMyIncidents(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const page = Math.max(1, parseInt(String(req.query.page ?? 1), 10) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? 10), 10) || 10));

            const result = await incidentService.getMyIncidents(String(req.user._id), page, limit);

            return ApiResponseHelper.success(
                res,
                result.data,
                "Incidents fetched successfully",
                200,
                result.meta
            );
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async getPublicIncidents(req: Request, res: Response) {
        try {
            const incidents = await incidentService.getPublicIncidents();

            return ApiResponseHelper.success(res, incidents, "Public incidents fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async updateIncident(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const incidentId = String(req.params.id);

            // Multipart form-data sends numbers as strings — coerce before validation.
            const body = {
                ...req.body,
                latitude: req.body.latitude !== undefined ? Number(req.body.latitude) : undefined,
                longitude: req.body.longitude !== undefined ? Number(req.body.longitude) : undefined,
            };

            const parsedData = UpdateIncidentDTO.safeParse(body);
            if (!parsedData.success) {
                const message = parsedData.error.issues
                    .map((e: any) => e.message)
                    .join(", ");
                return ApiResponseHelper.error(res, message, 400);
            }

            // Build relative URL for the uploaded photo (if present)
            let photoUrl: string | undefined;
            if (req.file) {
                photoUrl = `/uploads/${path.basename(req.file.path)}`;
            }

            const incident = await incidentService.updateIncident(
                String(req.user._id),
                incidentId,
                parsedData.data,
                photoUrl
            );

            return ApiResponseHelper.success(res, incident, "Incident updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async deleteIncident(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const incidentId = String(req.params.id);
            await incidentService.deleteIncident(String(req.user._id), incidentId);

            return ApiResponseHelper.success(res, null, "Incident deleted successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async getNearbyIncidents(req: Request, res: Response) {
        try {
            const { latitude, longitude, maxDistance } = req.query;

            if (!latitude || !longitude) {
                return ApiResponseHelper.error(res, "Latitude and longitude are required", 400);
            }

            const lat = Number(latitude);
            const lng = Number(longitude);
            const maxDist = maxDistance ? Number(maxDistance) : 10;

            if (isNaN(lat) || isNaN(lng)) {
                return ApiResponseHelper.error(res, "Invalid latitude or longitude", 400);
            }

            const incidents = await incidentService.getNearbyIncidents(lat, lng, maxDist);

            return ApiResponseHelper.success(res, incidents, "Nearby incidents fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async getRiskZones(req: Request, res: Response) {
        try {
            const { latitude, longitude, maxDistance } = req.query;

            if (!latitude || !longitude) {
                return ApiResponseHelper.error(res, "Latitude and longitude are required", 400);
            }

            const lat = Number(latitude);
            const lng = Number(longitude);
            const maxDist = maxDistance ? Number(maxDistance) : 10;

            if (isNaN(lat) || isNaN(lng)) {
                return ApiResponseHelper.error(res, "Invalid latitude or longitude", 400);
            }

            const riskZones = await incidentService.getRiskZones(lat, lng, maxDist);

            return ApiResponseHelper.success(res, riskZones, "Risk zones fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }
}
