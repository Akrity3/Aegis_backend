import { RefreshTokenModel, IRefreshToken } from "../models/refreshToken.model";

export interface IRefreshTokenRepository {
    createRefreshToken(data: Partial<IRefreshToken>): Promise<IRefreshToken>;
    findByToken(token: string): Promise<IRefreshToken | null>;
    findByUserId(userId: string): Promise<IRefreshToken[]>;
    revokeToken(token: string): Promise<IRefreshToken | null>;
    revokeAllUserTokens(userId: string): Promise<void>;
    deleteToken(token: string): Promise<boolean>;
    deleteExpiredTokens(): Promise<number>;
}

export class RefreshTokenRepository implements IRefreshTokenRepository {
    async createRefreshToken(data: Partial<IRefreshToken>): Promise<IRefreshToken> {
        const refreshToken = new RefreshTokenModel(data);
        return await refreshToken.save();
    }

    async findByToken(token: string): Promise<IRefreshToken | null> {
        return await RefreshTokenModel.findOne({ token });
    }

    async findByUserId(userId: string): Promise<IRefreshToken[]> {
        return await RefreshTokenModel.find({ userId }).sort({ createdAt: -1 });
    }

    async revokeToken(token: string): Promise<IRefreshToken | null> {
        return await RefreshTokenModel.findOneAndUpdate(
            { token },
            { isRevoked: true, revokedAt: new Date() },
            { new: true }
        );
    }

    async revokeAllUserTokens(userId: string): Promise<void> {
        await RefreshTokenModel.updateMany(
            { userId, isRevoked: false },
            { isRevoked: true, revokedAt: new Date() }
        );
    }

    async deleteToken(token: string): Promise<boolean> {
        const result = await RefreshTokenModel.deleteOne({ token });
        return result.deletedCount === 1;
    }

    async deleteExpiredTokens(): Promise<number> {
        const result = await RefreshTokenModel.deleteMany({
            expiresAt: { $lt: new Date() }
        });
        return result.deletedCount || 0;
    }
}
