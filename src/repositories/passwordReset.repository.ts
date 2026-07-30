import { PasswordResetModel, IPasswordReset } from "../models/passwordReset.model";

export interface IPasswordResetRepository {
    createPasswordReset(email: string, token: string): Promise<IPasswordReset>;
    findByToken(token: string): Promise<IPasswordReset | null>;
    findByEmailAndValidToken(email: string): Promise<IPasswordReset | null>;
    markAsUsed(token: string): Promise<IPasswordReset | null>;
    invalidateAllForEmail(email: string): Promise<void>;
    deleteExpired(): Promise<void>;
}

export class PasswordResetMongoRepository implements IPasswordResetRepository {
    async createPasswordReset(email: string, token: string): Promise<IPasswordReset> {
        // Invalidate any existing tokens for this email
        await this.invalidateAllForEmail(email);
        
        return PasswordResetModel.create({
            email,
            token,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
            used: false,
        });
    }

    async findByToken(token: string): Promise<IPasswordReset | null> {
        return PasswordResetModel.findOne({
            token,
            used: false,
            expiresAt: { $gt: new Date() },
        });
    }

    async findByEmailAndValidToken(email: string): Promise<IPasswordReset | null> {
        return PasswordResetModel.findOne({
            email,
            used: false,
            expiresAt: { $gt: new Date() },
        }).sort({ createdAt: -1 });
    }

    async markAsUsed(token: string): Promise<IPasswordReset | null> {
        return PasswordResetModel.findOneAndUpdate(
            { token },
            { used: true },
            { new: true }
        );
    }

    async invalidateAllForEmail(email: string): Promise<void> {
        await PasswordResetModel.updateMany(
            { email, used: false },
            { used: true }
        );
    }

    async deleteExpired(): Promise<void> {
        await PasswordResetModel.deleteMany({
            expiresAt: { $lt: new Date() },
        });
    }
}
