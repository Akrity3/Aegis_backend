import { SafetyCircleModel, ISafetyCircle } from "../models/safetyCircle.model";

export class SafetyCircleService {
    /**
     * Add a contact to the safety circle
     */
    async addToSafetyCircle(userId: string, contactId: string): Promise<ISafetyCircle> {
        const safetyCircle = await SafetyCircleModel.create({
            userId,
            contactId,
            status: "active",
        });
        return safetyCircle;
    }

    /**
     * Get all safety circle members for a user
     */
    async getSafetyCircle(userId: string): Promise<ISafetyCircle[]> {
        const safetyCircle = await SafetyCircleModel.find({ userId })
            .populate("contactId")
            .sort({ createdAt: -1 });
        return safetyCircle;
    }

    /**
     * Update safety circle member status
     */
    async updateStatus(userId: string, circleId: string, status: "active" | "inactive" | "pending"): Promise<ISafetyCircle | null> {
        const safetyCircle = await SafetyCircleModel.findOneAndUpdate(
            { _id: circleId, userId },
            { status },
            { new: true }
        ).populate("contactId");
        return safetyCircle;
    }

    /**
     * Update last location of a safety circle member
     */
    async updateLocation(
        userId: string,
        circleId: string,
        latitude: number,
        longitude: number
    ): Promise<ISafetyCircle | null> {
        const safetyCircle = await SafetyCircleModel.findOneAndUpdate(
            { _id: circleId, userId },
            {
                lastLocation: {
                    latitude,
                    longitude,
                    updatedAt: new Date(),
                },
                lastSeen: new Date(),
            },
            { new: true }
        ).populate("contactId");
        return safetyCircle;
    }

    /**
     * Remove a contact from safety circle
     */
    async removeFromSafetyCircle(userId: string, circleId: string): Promise<void> {
        await SafetyCircleModel.deleteOne({ _id: circleId, userId });
    }

    /**
     * Get a specific safety circle member
     */
    async getSafetyCircleMember(userId: string, circleId: string): Promise<ISafetyCircle | null> {
        const safetyCircle = await SafetyCircleModel.findOne({ _id: circleId, userId })
            .populate("contactId");
        return safetyCircle;
    }
}
