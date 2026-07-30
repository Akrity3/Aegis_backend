import mongoose, { Schema, Document } from "mongoose";

export const AUDIT_ACTIONS = [
    "admin_login",
    "user_created",
    "user_updated",
    "user_deleted",
    "user_blocked",
    "user_unblocked",
    "role_changed",
    "incident_verified",
    "incident_rejected",
    "incident_deleted",
    "alert_resolved",
    "settings_updated",
    "safety_circle_modified",
    "notification_sent",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface IAuditLog extends Document {
    _id: mongoose.Types.ObjectId;
    adminId: mongoose.Types.ObjectId;
    action: AuditAction;
    targetId?: mongoose.Types.ObjectId;
    targetType?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
    adminId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Admin ID is required"],
        index: true,
    },
    action: {
        type: String,
        enum: AUDIT_ACTIONS,
        required: [true, "Action is required"],
        index: true,
    },
    targetId: {
        type: Schema.Types.ObjectId,
        index: true,
    },
    targetType: {
        type: String,
        enum: ["User", "Incident", "Alert", "Settings", "SafetyCircle", "Notification"],
    },
    details: {
        type: Schema.Types.Mixed,
        default: {},
    },
    ipAddress: {
        type: String,
    },
    userAgent: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
});

// Compound indexes for efficient queries
AuditLogSchema.index({ adminId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ targetId: 1, timestamp: -1 });

export const AuditLogModel = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
