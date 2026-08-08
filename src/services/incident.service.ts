import mongoose from "mongoose";
import { IncidentModel } from "../models/incident.model";
import { CreateIncidentDTOType, UpdateIncidentDTOType } from "../dtos/incident.dto";
import { HttpException } from "../exceptions/http-exception";

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
            location: {
                type: "Point",
                coordinates: [data.longitude, data.latitude], // GeoJSON uses [longitude, latitude]
            },
        });

        await incident.save();
        return incident;
    }

    async getMyIncidents(userId: string, page: number = 1, limit: number = 10): Promise<{ data: any[], meta: { page: number, limit: number, total: number, totalPages: number } }> {
        const skip = (page - 1) * limit;
        const total = await IncidentModel.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });
        const totalPages = Math.ceil(total / limit);

        const data = await IncidentModel.find({
            userId: new mongoose.Types.ObjectId(userId),
        })
            .sort({ reportedAt: -1 })
            .skip(skip)
            .limit(limit);

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages
            }
        };
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
        // Only return approved/verified incidents on public feeds and Safety Map.
        const filter = { status: "verified" as const };

        return await IncidentModel.find(filter)
            .select("-userId")
            .sort({ reportedAt: -1 })
            .limit(200);
    }

    async updateIncident(
        userId: string,
        incidentId: string,
        data: UpdateIncidentDTOType,
        photoUrl?: string
    ) {
        const incident = await IncidentModel.findOne({
            _id: new mongoose.Types.ObjectId(incidentId),
            userId: new mongoose.Types.ObjectId(userId),
        });

        if (!incident) {
            throw new HttpException(404, "Incident not found");
        }

        // Update only provided fields
        if (data.category !== undefined) incident.category = data.category;
        if (data.description !== undefined) incident.description = data.description;
        if (data.latitude !== undefined) {
            incident.latitude = data.latitude;
            // Update location if latitude/longitude changes
            const lng = data.longitude !== undefined ? data.longitude : incident.longitude;
            incident.location = {
                type: "Point",
                coordinates: [lng, data.latitude],
            };
        }
        if (data.longitude !== undefined) {
            incident.longitude = data.longitude;
            // Update location if latitude/longitude changes
            const lat = data.latitude !== undefined ? data.latitude : incident.latitude;
            incident.location = {
                type: "Point",
                coordinates: [data.longitude, lat],
            };
        }
        if (data.address !== undefined) incident.address = data.address;
        if (photoUrl !== undefined) incident.photoUrl = photoUrl;

        await incident.save();
        return incident;
    }

    async deleteIncident(userId: string, incidentId: string) {
        const incident = await IncidentModel.findOne({
            _id: new mongoose.Types.ObjectId(incidentId),
            userId: new mongoose.Types.ObjectId(userId),
        });

        if (!incident) {
            throw new HttpException(404, "Incident not found");
        }

        await IncidentModel.deleteOne({ _id: incident._id });
        return incident;
    }

    async getNearbyIncidents(latitude: number, longitude: number, maxDistanceKm: number = 10, limit: number = 50) {
        const incidents = await IncidentModel.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude],
                    },
                    $maxDistance: maxDistanceKm * 1000, // Convert km to meters
                },
            },
            status: "verified", // Only return verified incidents for public safety map
        })
            .select("-userId")
            .limit(limit);

        return incidents;
    }

    async getRiskZones(latitude: number, longitude: number, maxDistanceKm: number = 10) {
        const incidents = await IncidentModel.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [longitude, latitude],
                    },
                    maxDistance: maxDistanceKm * 1000,
                    distanceField: "distance",
                    spherical: true,
                },
            },
            {
                $match: {
                    status: "verified",
                },
            },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                    incidents: {
                        $push: {
                            _id: "$_id",
                            category: "$category",
                            description: "$description",
                            latitude: "$latitude",
                            longitude: "$longitude",
                            address: "$address",
                            photoUrl: "$photoUrl",
                            reportedAt: "$reportedAt",
                            distance: "$distance",
                        },
                    },
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);

        return incidents;
    }
}
