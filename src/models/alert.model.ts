import mongoose, { Schema, Document } from "mongoose";

export interface IAlert extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    latitude: number;
    longitude: number;
    address?: string;
    status: "active" | "resolved";
    triggeredAt: Date;
    resolvedAt?: Date;
}

const AlertSchema = new Schema<IAlert>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        latitude: {
            type: Number,
            required: [true, "Latitude is required"],
        },
        longitude: {
            type: Number,
            required: [true, "Longitude is required"],
        },
        address: {
            type: String,
        },
        status: {
            type: String,
            enum: ["active", "resolved"],
            default: "active",
        },
        triggeredAt: {
            type: Date,
            default: Date.now,
        },
        resolvedAt: {
            type: Date,
        },
    }
);

export const AlertModel = mongoose.model<IAlert>("Alert", AlertSchema);
