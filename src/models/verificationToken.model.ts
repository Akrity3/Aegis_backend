import mongoose, { Schema, Document } from "mongoose";

export interface IVerificationToken extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    token: string;
    type: "email" | "password_reset";
    expiresAt: Date;
    used: boolean;
    usedAt?: Date;
    createdAt: Date;
}

const VerificationTokenSchema = new Schema<IVerificationToken>({
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
    type: {
        type: String,
        enum: ["email", "password_reset"],
        required: [true, "Token type is required"],
    },
    expiresAt: {
        type: Date,
        required: [true, "Expiration date is required"],
    },
    used: {
        type: Boolean,
        default: false,
        index: true,
    },
    usedAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient queries
VerificationTokenSchema.index({ userId: 1, type: 1, createdAt: -1 });
VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-cleanup

export const VerificationTokenModel = mongoose.model<IVerificationToken>("VerificationToken", VerificationTokenSchema);
