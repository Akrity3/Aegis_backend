import mongoose from "mongoose";
import { IncidentModel } from "../models/incident.model";
import { CreateIncidentDTOType } from "../dtos/incident.dto";

export class IncidentService {
    async createIncident(
        userId: string,
        data: CreateIncidentDTOType,
        photoUrl?: string
    ) {
        const incident = new IncidentModel({
            userId: new mongoose.Types.ObjectId(userId),
            category: data.category,
            description: data.description,
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address,
            photoUrl: photoUrl ?? undefined,
            status: "pending",
            reportedAt: new Date(),
        });

        await incident.save();
        return incident;
    }

    async getMyIncidents(userId: string) {
        return await IncidentModel.find({
            userId: new mongoose.Types.ObjectId(userId),
        }).sort({ reportedAt: -1 });
    }

    /**
     * Returns public-safe incident data for the community feed and Safety Map.
     *
     * Architecture note: The query is intentionally structured so that adding
     * a status filter (e.g. only "verified") later requires only a single-line
     * change to the `filter` object — no model or route changes needed.
     *
     * Fields intentionally excluded: userId (personal identifier).
     * Fields included: category, coordinates, address, photoUrl, status, reportedAt.
     */
    async getPublicIncidents() {
        // Future: change filter to { status: "verified" } once admin moderation is live.
        const filter = {};

        return await IncidentModel.find(filter)
            .select("-userId")
            .sort({ reportedAt: -1 })
            .limit(200);
    }
}
