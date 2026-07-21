import { Request, Response } from "express";
import { SafetyCircleService } from "../services/safetyCircle.service";

const safetyCircleService = new SafetyCircleService();

export class SafetyCircleController {
    async addToSafetyCircle(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
            }

            const { contactId } = req.body;
            if (!contactId) {
                return res.status(400).json({ message: "Contact ID is required" });
            }

            const safetyCircle = await safetyCircleService.addToSafetyCircle(
                String(req.user._id),
                contactId
            );

            return res.status(201).json({
                success: true,
                message: "Contact added to safety circle successfully.",
                data: safetyCircle,
            });
        } catch (error: any) {
            return res
                .status(error.status || error.statusCode || 500)
                .json({ message: error.message || "Internal Server Error" });
        }
    }

    async getSafetyCircle(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
            }

            const safetyCircle = await safetyCircleService.getSafetyCircle(String(req.user._id));

            return res.status(200).json({
                success: true,
                message: "Safety circle fetched successfully.",
                data: safetyCircle,
            });
        } catch (error: any) {
            return res
                .status(error.status || error.statusCode || 500)
                .json({ message: error.message || "Internal Server Error" });
        }
    }

    async updateStatus(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
            }

            const { circleId } = req.params;
            const { status } = req.body;

            if (!circleId || Array.isArray(circleId)) {
                return res.status(400).json({ message: "Circle ID is required" });
            }
            if (!status) {
                return res.status(400).json({ message: "Status is required" });
            }

            const safetyCircle = await safetyCircleService.updateStatus(
                String(req.user._id),
                circleId,
                status
            );

            if (!safetyCircle) {
                return res.status(404).json({ message: "Safety circle member not found" });
            }

            return res.status(200).json({
                success: true,
                message: "Status updated successfully.",
                data: safetyCircle,
            });
        } catch (error: any) {
            return res
                .status(error.status || error.statusCode || 500)
                .json({ message: error.message || "Internal Server Error" });
        }
    }

    async updateLocation(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
            }

            const { circleId } = req.params;
            const { latitude, longitude } = req.body;

            if (!circleId || Array.isArray(circleId)) {
                return res.status(400).json({ message: "Circle ID is required" });
            }
            if (latitude === undefined || longitude === undefined) {
                return res.status(400).json({ message: "Latitude and longitude are required" });
            }

            const safetyCircle = await safetyCircleService.updateLocation(
                String(req.user._id),
                circleId,
                Number(latitude),
                Number(longitude)
            );

            if (!safetyCircle) {
                return res.status(404).json({ message: "Safety circle member not found" });
            }

            return res.status(200).json({
                success: true,
                message: "Location updated successfully.",
                data: safetyCircle,
            });
        } catch (error: any) {
            return res
                .status(error.status || error.statusCode || 500)
                .json({ message: error.message || "Internal Server Error" });
        }
    }

    async removeFromSafetyCircle(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
            }

            const { circleId } = req.params;
            if (!circleId || Array.isArray(circleId)) {
                return res.status(400).json({ message: "Circle ID is required" });
            }

            await safetyCircleService.removeFromSafetyCircle(String(req.user._id), circleId);

            return res.status(200).json({
                success: true,
                message: "Contact removed from safety circle successfully.",
            });
        } catch (error: any) {
            return res
                .status(error.status || error.statusCode || 500)
                .json({ message: error.message || "Internal Server Error" });
        }
    }
}
