import { Request, Response } from "express";
import { TriggerAlertDTO, ResolveAlertDTO } from "../dtos/alert.dto";
import { AlertService } from "../services/alert.service";

const alertService = new AlertService();

export class AlertController {
    async getMyAlerts(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
            }

            const alerts = await alertService.getMyAlerts(String(req.user._id));

            return res.status(200).json({
                success: true,
                message: "Alerts fetched successfully.",
                data: alerts,
            });
        } catch (error: any) {
            return res.status(error.status || error.statusCode || 500).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async triggerAlert(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
            }

            const parsedData = TriggerAlertDTO.safeParse(req.body);
            if (!parsedData.success) {
                const message = parsedData.error.issues.map((e: any) => e.message).join(", ");
                return res.status(400).json({ message });
            }

            const alert = await alertService.triggerAlert(String(req.user._id), parsedData.data);

            return res.status(201).json({
                success: true,
                message: "SOS triggered successfully.",
                data: alert,
            });
        } catch (error: any) {
            return res.status(error.status || error.statusCode || 500).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async resolveAlert(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
            }

            const alertId = req.params.id as string;
            
            // Just structural validation for id if necessary, but params comes from URL
            if (!alertId) {
                return res.status(400).json({ message: "Alert ID is required" });
            }

            await alertService.resolveAlert(String(req.user._id), alertId);

            return res.status(200).json({
                success: true,
                message: "SOS resolved successfully.",
            });
        } catch (error: any) {
            return res.status(error.status || error.statusCode || 500).json({
                message: error.message || "Internal Server Error",
            });
        }
    }
}
