import mongoose, { Schema, Document } from "mongoose";

export interface IRefreshToken extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    isRevoked: boolean;
    revokedAt?: Date;
    userAgent?: string;
    ipAddress?: string;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
        token: {
            type: String,
            required: [true, "Token is required"],
            unique: true,
        },
        expiresAt: {
            type: Date,
            required: [true, "Expiration date is required"],
        },
        isRevoked: {
            type: Boolean,
            default: false,
            index: true,
        },
        revokedAt: {
            type: Date,
        },
        userAgent: {
            type: String,
        },
        ipAddress: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient cleanup of expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for finding active tokens for a user
RefreshTokenSchema.index({ userId: 1, isRevoked: 1, expiresAt: 1 });

export const RefreshTokenModel = mongoose.model<IRefreshToken>("RefreshToken", RefreshTokenSchema);
