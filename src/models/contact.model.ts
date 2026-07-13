import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    name: string;
    phoneNumber: string;
    relation: string;
    isPrimary: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ContactMongoSchema = new Schema<IContact>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: [true, "Please add a contact name"],
            trim: true,
        },
        phoneNumber: {
            type: String,
            required: [true, "Please add a phone number"],
            trim: true,
        },
        relation: {
            type: String,
            trim: true,
            default: "Family",
        },
        isPrimary: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent a user from adding duplicate phone numbers
ContactMongoSchema.index({ userId: 1, phoneNumber: 1 }, { unique: true });

export const ContactModel = mongoose.model<IContact>("Contact", ContactMongoSchema);
