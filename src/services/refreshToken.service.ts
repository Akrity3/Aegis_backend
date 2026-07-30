import crypto from "crypto";
import mongoose from "mongoose";
import { RefreshTokenRepository } from "../repositories/refreshToken.repository";
import { HttpException } from "../exceptions/http-exception";
import { SECRET_KEY, JWT_EXPIRE } from "../configs/constant";
import { IUser } from "../models/user.model";

const refreshTokenRepository = new RefreshTokenRepository();

export class RefreshTokenService {
    /**
     * Generate a secure random refresh token
     */
    private generateToken(): string {
        return crypto.randomBytes(40).toString("hex");
    }

    /**
     * Calculate refresh token expiry (30 days from now)
     */
    private calculateExpiry(): Date {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        return expiryDate;
    }

    /**
     * Create a new refresh token for a user
     */
    async createRefreshToken(
        userId: string,
        userAgent?: string,
        ipAddress?: string
    ): Promise<string> {
        const token = this.generateToken();
        const expiresAt = this.calculateExpiry();

        await refreshTokenRepository.createRefreshToken({
            userId: new mongoose.Types.ObjectId(userId),
            token,
            expiresAt,
            userAgent,
            ipAddress,
        });

        return token;
    }

    /**
     * Validate a refresh token and return the associated user ID
     */
    async validateRefreshToken(token: string): Promise<string> {
        const refreshToken = await refreshTokenRepository.findByToken(token);

        if (!refreshToken) {
            throw new HttpException(401, "Invalid refresh token");
        }

        if (refreshToken.isRevoked) {
            throw new HttpException(401, "Refresh token has been revoked");
        }

        if (refreshToken.expiresAt < new Date()) {
            throw new HttpException(401, "Refresh token has expired");
        }

        return refreshToken.userId.toString();
    }

    /**
     * Rotate refresh token (create new, revoke old)
     */
    async rotateRefreshToken(
        oldToken: string,
        userAgent?: string,
        ipAddress?: string
    ): Promise<{ newRefreshToken: string; userId: string }> {
        const userId = await this.validateRefreshToken(oldToken);

        // Revoke the old token
        await refreshTokenRepository.revokeToken(oldToken);

        // Create a new token
        const newRefreshToken = await this.createRefreshToken(
            userId,
            userAgent,
            ipAddress
        );

        return { newRefreshToken, userId };
    }

    /**
     * Revoke a specific refresh token
     */
    async revokeRefreshToken(token: string): Promise<void> {
        const refreshToken = await refreshTokenRepository.findByToken(token);
        if (!refreshToken) {
            throw new HttpException(404, "Refresh token not found");
        }
        await refreshTokenRepository.revokeToken(token);
    }

    /**
     * Revoke all refresh tokens for a user
     */
    async revokeAllUserTokens(userId: string): Promise<void> {
        await refreshTokenRepository.revokeAllUserTokens(userId);
    }

    /**
     * Delete a specific refresh token
     */
    async deleteRefreshToken(token: string): Promise<void> {
        const deleted = await refreshTokenRepository.deleteToken(token);
        if (!deleted) {
            throw new HttpException(404, "Refresh token not found");
        }
    }

    /**
     * Clean up expired tokens (maintenance task)
     */
    async cleanupExpiredTokens(): Promise<number> {
        return await refreshTokenRepository.deleteExpiredTokens();
    }
}
