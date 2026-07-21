import mongoose, { Schema, Document } from "mongoose";

export const NOTIFICATION_TYPES = [
    "alert_triggered",
    "alert_resolved",
    "incident_reported",
    "incident_verified",
    "contact_added",
    "profile_updated",
    "password_changed",
    "system",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface INotification extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
        index: true,
    },
    type: {
        type: String,
        enum: NOTIFICATION_TYPES,
        required: [true, "Notification type is required"],
    },
    title: {
        type: String,
        required: [true, "Title is required"],
        maxlength: [100, "Title must be at most 100 characters"],
    },
    message: {
        type: String,
        required: [true, "Message is required"],
        maxlength: [500, "Message must be at most 500 characters"],
    },
    read: {
        type: Boolean,
        default: false,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient queries
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<INotification>("Notification", NotificationSchema);
