import mongoose, { Schema, Document } from "mongoose";

export interface IDevice extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    token: string;
    platform: "ios" | "android" | "web";
    deviceName?: string;
    isActive: boolean;
    lastUsedAt?: Date;
    createdAt: Date;
}

const DeviceSchema = new Schema<IDevice>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
        index: true,
    },
    token: {
        type: String,
        required: [true, "Device token is required"],
        unique: true,
    },
    platform: {
        type: String,
        enum: ["ios", "android", "web"],
        required: [true, "Platform is required"],
    },
    deviceName: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    lastUsedAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Indexes for efficient queries
DeviceSchema.index({ userId: 1, isActive: 1 });

export const DeviceModel = mongoose.model<IDevice>("Device", DeviceSchema);
