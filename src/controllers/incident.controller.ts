import { Request, Response } from "express";
import path from "path";
import { CreateIncidentDTO } from "../dtos/incident.dto";
import { IncidentService } from "../services/incident.service";

const incidentService = new IncidentService();

export class IncidentController {
    async createIncident(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
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
                return res.status(400).json({ message });
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

            return res.status(201).json({
                success: true,
                message: "Incident reported successfully.",
                data: incident,
            });
        } catch (error: any) {
            return res
                .status(error.status || error.statusCode || 500)
                .json({ message: error.message || "Internal Server Error" });
        }
    }

    async getMyIncidents(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
            }

            const incidents = await incidentService.getMyIncidents(
                String(req.user._id)
            );

            return res.status(200).json({
                success: true,
                message: "Incidents fetched successfully.",
                data: incidents,
            });
        } catch (error: any) {
            return res
                .status(error.status || error.statusCode || 500)
                .json({ message: error.message || "Internal Server Error" });
        }
    }

    async getPublicIncidents(req: Request, res: Response) {
        try {
            const incidents = await incidentService.getPublicIncidents();

            return res.status(200).json({
                success: true,
                message: "Public incidents fetched successfully.",
                data: incidents,
            });
        } catch (error: any) {
            return res
                .status(error.status || error.statusCode || 500)
                .json({ message: error.message || "Internal Server Error" });
        }
    }
}
