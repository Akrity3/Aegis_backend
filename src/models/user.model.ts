import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserType } from "../types/user.type";
import { SECRET_KEY, JWT_EXPIRE } from "../configs/constant";

export interface IUser extends Omit<UserType, "password">, Document {
    _id: mongoose.Types.ObjectId;
    password?: string;
    createdAt: Date;
    getSignedJwtToken(): string;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserMongoSchema = new Schema<IUser>(
    {
        firstName: {
            type: String,
            required: [true, "Please add a first name"],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, "Please add a last name"],
            trim: true,
        },
        gender: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Please add an email"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please add a valid email",
            ],
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Please add a password"],
            minlength: 6,
            select: false,
        },
        phoneNumber: {
            type: String,
            trim: true,
        },
        profilePicture: {
            type: String,
            default: "default-profile.png",
            trim: true,
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user",
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

// Pre-save hook
UserMongoSchema.pre("save", async function (this: any) {
    if (!this.isModified("password")) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    if (this.password) {
        this.password = await bcrypt.hash(this.password, salt);
    }
});

// Methods
UserMongoSchema.methods.getSignedJwtToken = function (this: IUser) {
    return jwt.sign({ id: this._id }, SECRET_KEY, {
        expiresIn: JWT_EXPIRE as any,
    });
};

UserMongoSchema.methods.matchPassword = async function (
    this: IUser,
    enteredPassword: string
) {
    return await bcrypt.compare(enteredPassword, this.password || "");
};

export const UserModel = mongoose.model<IUser>("User", UserMongoSchema);
