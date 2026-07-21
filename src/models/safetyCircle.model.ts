import mongoose, { Schema, Document } from "mongoose";

export interface ISafetyCircle extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    contactId: mongoose.Types.ObjectId;
    status: "active" | "inactive" | "pending";
    lastLocation?: {
        latitude: number;
        longitude: number;
        updatedAt: Date;
    };
    lastSeen?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const SafetyCircleSchema = new Schema<ISafetyCircle>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
        contactId: {
            type: Schema.Types.ObjectId,
            ref: "Contact",
            required: [true, "Contact ID is required"],
            index: true,
        },
        status: {
            type: String,
            enum: ["active", "inactive", "pending"],
            default: "active",
        },
        lastLocation: {
            latitude: { type: Number },
            longitude: { type: Number },
            updatedAt: { type: Date },
        },
        lastSeen: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Unique combination of user and contact
SafetyCircleSchema.index({ userId: 1, contactId: 1 }, { unique: true });

export const SafetyCircleModel = mongoose.model<ISafetyCircle>("SafetyCircle", SafetyCircleSchema);
