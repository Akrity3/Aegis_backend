import { Request, Response } from "express";
import { DeviceService } from "../services/device.service";
import { RegisterDeviceDTO, RemoveDeviceDTO } from "../dtos/device.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { ActivityService } from "../services/activity.service";

const deviceService = new DeviceService();
const activityService = new ActivityService();

export class DeviceController {
    async registerDevice(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const parsedData = RegisterDeviceDTO.safeParse(req.body);
            if (!parsedData.success) {
                const message = parsedData.error.issues.map((e: any) => e.message).join(", ");
                return ApiResponseHelper.error(res, message, 400);
            }

            const device = await deviceService.registerDevice(
                String(req.user._id),
                parsedData.data
            );

            // Log device registration activity
            await activityService.createActivity(
                req.user._id.toString(),
                "device_registered",
                "Device registered for push notifications",
                { platform: parsedData.data.platform, deviceName: parsedData.data.deviceName },
                req.ip,
                req.headers["user-agent"]
            );

            return ApiResponseHelper.success(res, device, "Device registered successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async getMyDevices(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const devices = await deviceService.getUserDevices(String(req.user._id));

            return ApiResponseHelper.success(res, devices, "Devices fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async removeDevice(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const parsedData = RemoveDeviceDTO.safeParse(req.body);
            if (!parsedData.success) {
                const message = parsedData.error.issues.map((e: any) => e.message).join(", ");
                return ApiResponseHelper.error(res, message, 400);
            }

            await deviceService.removeDevice(
                String(req.user._id),
                parsedData.data.deviceId
            );

            // Log device removal activity
            await activityService.createActivity(
                req.user._id.toString(),
                "device_removed",
                "Device removed from account",
                { deviceId: parsedData.data.deviceId },
                req.ip,
                req.headers["user-agent"]
            );

            return ApiResponseHelper.success(res, null, "Device removed successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }
}
