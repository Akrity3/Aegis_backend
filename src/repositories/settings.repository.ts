import { SettingsModel, ISystemSettings } from "../models/settings.model";

export interface ISettingsRepository {
    getSettings(): Promise<ISystemSettings>;
    updateSettings(settings: Partial<ISystemSettings>): Promise<ISystemSettings>;
}

export class SettingsMongoRepository implements ISettingsRepository {
    async getSettings(): Promise<ISystemSettings> {
        return (SettingsModel as any).getSettings();
    }

    async updateSettings(settings: Partial<ISystemSettings>): Promise<ISystemSettings> {
        const current = await this.getSettings();
        const updated = await SettingsModel.findByIdAndUpdate(
            current._id,
            { ...settings },
            { returnDocument: 'after', new: true }
        );
        return updated as ISystemSettings;
    }
}
