import { DeviceRepository } from "../repositories/device.repository";
import { HttpException } from "../exceptions/http-exception";
import { RegisterDeviceDTOType } from "../dtos/device.dto";

export class DeviceService {
    private deviceRepository: DeviceRepository;

    constructor() {
        this.deviceRepository = new DeviceRepository();
    }

    async registerDevice(userId: string, data: RegisterDeviceDTOType) {
        // Check if device token already exists
        const existingDevice = await this.deviceRepository.getDeviceByToken(data.token);
        
        if (existingDevice) {
            // If device exists but belongs to different user, throw error
            if (existingDevice.userId.toString() !== userId) {
                throw new HttpException(400, "Device token is already registered to another user");
            }
            
            // If device belongs to same user, just update last used time
            await this.deviceRepository.updateLastUsed(existingDevice._id.toString());
            return existingDevice;
        }

        // Create new device
        const device = await this.deviceRepository.createDevice({
            userId,
            token: data.token,
            platform: data.platform,
            deviceName: data.deviceName,
        });

        return device;
    }

    async getUserDevices(userId: string) {
        return await this.deviceRepository.getUserDevices(userId);
    }

    async removeDevice(userId: string, deviceId: string) {
        const device = await this.deviceRepository.getDeviceByToken(deviceId);
        
        if (!device) {
            throw new HttpException(404, "Device not found");
        }

        if (device.userId.toString() !== userId) {
            throw new HttpException(403, "You do not have permission to remove this device");
        }

        await this.deviceRepository.deleteDevice(userId, deviceId);
    }

    async deactivateAllUserDevices(userId: string) {
        await this.deviceRepository.deactivateAllUserDevices(userId);
    }
}
