import mongoose from "mongoose";
import { DeviceModel, IDevice } from "../models/device.model";

export class DeviceRepository {
    async createDevice(deviceData: {
        userId: string;
        token: string;
        platform: "ios" | "android" | "web";
        deviceName?: string;
    }): Promise<IDevice> {
        const device = await DeviceModel.create({
            userId: new mongoose.Types.ObjectId(deviceData.userId),
            token: deviceData.token,
            platform: deviceData.platform,
            deviceName: deviceData.deviceName,
            isActive: true,
            lastUsedAt: new Date(),
        });
        return device;
    }

    async getDeviceByToken(token: string): Promise<IDevice | null> {
        return await DeviceModel.findOne({ token, isActive: true });
    }

    async getUserDevices(userId: string): Promise<IDevice[]> {
        return await DeviceModel.find({
            userId: new mongoose.Types.ObjectId(userId),
            isActive: true,
        }).sort({ createdAt: -1 });
    }

    async updateLastUsed(deviceId: string): Promise<void> {
        await DeviceModel.findByIdAndUpdate(deviceId, {
            lastUsedAt: new Date(),
        });
    }

    async deactivateDevice(userId: string, deviceId: string): Promise<void> {
        await DeviceModel.findOneAndUpdate(
            {
                _id: new mongoose.Types.ObjectId(deviceId),
                userId: new mongoose.Types.ObjectId(userId),
            },
            { isActive: false }
        );
    }

    async deactivateAllUserDevices(userId: string): Promise<void> {
        await DeviceModel.updateMany(
            {
                userId: new mongoose.Types.ObjectId(userId),
            },
            { isActive: false }
        );
    }

    async deleteDevice(userId: string, deviceId: string): Promise<void> {
        await DeviceModel.deleteOne({
            _id: new mongoose.Types.ObjectId(deviceId),
            userId: new mongoose.Types.ObjectId(userId),
        });
    }
}
