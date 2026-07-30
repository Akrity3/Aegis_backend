import mongoose, { Schema, Document } from "mongoose";

export interface IPasswordReset extends Document {
    email: string;
    token: string;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
}

const PasswordResetSchema = new Schema<IPasswordReset>(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        },
        used: {
            type: Boolean,
            default: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: false,
    }
);

// Index for token lookup
PasswordResetSchema.index({ token: 1 });
// Index for email lookup with expiration check
PasswordResetSchema.index({ email: 1, expiresAt: 1 });
// TTL index to automatically expire documents
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetModel = mongoose.model<IPasswordReset>("PasswordReset", PasswordResetSchema);
