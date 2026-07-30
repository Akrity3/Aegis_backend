import mongoose, { Schema, Document } from "mongoose";

export interface ISystemSettings extends Document {
    _id: mongoose.Types.ObjectId;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    emailVerificationRequired: boolean;
    maxUsersPerSafetyCircle: number;
    sosAlertCooldown: number; // in seconds
    incidentAutoVerify: boolean;
    defaultSearchRadius: number; // in meters
    notificationSettings: {
        emailEnabled: boolean;
        pushEnabled: boolean;
        smsEnabled: boolean;
    };
    updatedAt: Date;
    createdAt: Date;
}

const SettingsSchema = new Schema<ISystemSettings>(
    {
        maintenanceMode: {
            type: Boolean,
            default: false,
        },
        registrationEnabled: {
            type: Boolean,
            default: true,
        },
        emailVerificationRequired: {
            type: Boolean,
            default: true,
        },
        maxUsersPerSafetyCircle: {
            type: Number,
            default: 10,
            min: 1,
            max: 50,
        },
        sosAlertCooldown: {
            type: Number,
            default: 300, // 5 minutes
            min: 60,
            max: 3600,
        },
        incidentAutoVerify: {
            type: Boolean,
            default: false,
        },
        defaultSearchRadius: {
            type: Number,
            default: 5000, // 5km
            min: 100,
            max: 50000,
        },
        notificationSettings: {
            emailEnabled: {
                type: Boolean,
                default: true,
            },
            pushEnabled: {
                type: Boolean,
                default: true,
            },
            smsEnabled: {
                type: Boolean,
                default: false,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Singleton pattern - only one settings document should exist
SettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

export const SettingsModel = mongoose.model<ISystemSettings>("SystemSettings", SettingsSchema);
