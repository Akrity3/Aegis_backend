import { ISystemSettings } from "../models/settings.model";
import { SettingsMongoRepository } from "../repositories/settings.repository";
import { HttpException } from "../exceptions/http-exception";

const settingsRepository = new SettingsMongoRepository();

export class SettingsService {
    async getSettings(): Promise<ISystemSettings> {
        return await settingsRepository.getSettings();
    }

    async updateSettings(data: Partial<ISystemSettings>): Promise<ISystemSettings> {
        // Validate numeric ranges
        if (data.maxUsersPerSafetyCircle !== undefined) {
            if (data.maxUsersPerSafetyCircle < 1 || data.maxUsersPerSafetyCircle > 50) {
                throw new HttpException(400, "maxUsersPerSafetyCircle must be between 1 and 50");
            }
        }
        
        if (data.sosAlertCooldown !== undefined) {
            if (data.sosAlertCooldown < 60 || data.sosAlertCooldown > 3600) {
                throw new HttpException(400, "sosAlertCooldown must be between 60 and 3600 seconds");
            }
        }
        
        if (data.defaultSearchRadius !== undefined) {
            if (data.defaultSearchRadius < 100 || data.defaultSearchRadius > 50000) {
                throw new HttpException(400, "defaultSearchRadius must be between 100 and 50000 meters");
            }
        }

        return await settingsRepository.updateSettings(data);
    }
}
