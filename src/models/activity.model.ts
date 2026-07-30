import mongoose, { Schema, Document } from "mongoose";

export const ACTIVITY_TYPES = [
    "registration",
    "login",
    "logout",
    "profile_updated",
    "password_changed",
    "contact_added",
    "contact_updated",
    "contact_deleted",
    "alert_triggered",
    "alert_resolved",
    "incident_reported",
    "notification_read",
    "settings_updated",
    "device_registered",
    "device_removed",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface IActivity extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    type: ActivityType;
    description: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
        index: true,
    },
    type: {
        type: String,
        enum: ACTIVITY_TYPES,
        required: [true, "Activity type is required"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        maxlength: [500, "Description must be at most 500 characters"],
    },
    metadata: {
        type: Schema.Types.Mixed,
    },
    ipAddress: {
        type: String,
    },
    userAgent: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient queries
ActivitySchema.index({ userId: 1, createdAt: -1 });

export const ActivityModel = mongoose.model<IActivity>("Activity", ActivitySchema);
