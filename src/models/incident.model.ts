import mongoose, { Schema, Document } from "mongoose";

export const INCIDENT_CATEGORIES = [
    "Harassment",
    "Road Accident",
    "Theft / Robbery",
    "Suspicious Activity",
    "Natural Disaster",
    "Fire Emergency",
    "Unsafe Infrastructure / Road Hazard",
    "Other",
] as const;

export type IncidentCategory = (typeof INCIDENT_CATEGORIES)[number];

export interface IIncident extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    category: IncidentCategory;
    description: string;
    latitude: number;
    longitude: number;
    address?: string;
    photoUrl?: string;
    status: "pending" | "verified" | "rejected";
    reportedAt: Date;
}

const IncidentSchema = new Schema<IIncident>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
    },
    category: {
        type: String,
        enum: INCIDENT_CATEGORIES,
        required: [true, "Category is required"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        minlength: [10, "Description must be at least 10 characters"],
        maxlength: [500, "Description must be at most 500 characters"],
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
    photoUrl: {
        type: String,
    },
    status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
    },
    reportedAt: {
        type: Date,
        default: Date.now,
    },
});

export const IncidentModel = mongoose.model<IIncident>("Incident", IncidentSchema);
