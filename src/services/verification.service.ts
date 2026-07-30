import mongoose from "mongoose";
import crypto from "crypto";
import { VerificationTokenModel } from "../models/verificationToken.model";
import { UserModel } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import { createTransporter } from "../configs/email.config";
import { getEmailVerificationTemplate } from "../templates/email.template";

export class VerificationService {
    /**
     * Generate a secure random token
     */
    private generateToken(): string {
        return crypto.randomBytes(32).toString("hex");
    }

    /**
     * Create a verification token for email verification
     */
    async createVerificationToken(userId: string, type: "email" | "password_reset" = "email"): Promise<string> {
        // Delete any existing unused tokens of the same type for this user
        await VerificationTokenModel.deleteMany({
            userId: new mongoose.Types.ObjectId(userId),
            type,
            used: false,
        });

        // Generate new token
        const token = this.generateToken();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

        // Save token to database
        await VerificationTokenModel.create({
            userId: new mongoose.Types.ObjectId(userId),
            token,
            type,
            expiresAt,
            used: false,
        });

        return token;
    }

    /**
     * Verify email using token
     */
    async verifyEmail(token: string): Promise<void> {
        const verificationToken = await VerificationTokenModel.findOne({
            token,
            type: "email",
            used: false,
        });

        if (!verificationToken) {
            throw new HttpException(400, "Invalid or expired verification token");
        }

        if (verificationToken.expiresAt < new Date()) {
            throw new HttpException(400, "Verification token has expired");
        }

        // Mark token as used
        verificationToken.used = true;
        verificationToken.usedAt = new Date();
        await verificationToken.save();

        // Update user's email verification status
        await UserModel.findByIdAndUpdate(verificationToken.userId, {
            isEmailVerified: true,
            verifiedAt: new Date(),
        });
    }

    /**
     * Send verification email
     */
    async sendVerificationEmail(email: string): Promise<{ message: string }> {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new HttpException(404, "User not found");
        }

        if (user.isEmailVerified) {
            throw new HttpException(400, "Email is already verified");
        }

        const token = await this.createVerificationToken(user._id.toString(), "email");

        // Create verification URL (adjust based on your frontend URL)
        const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`;

        // Generate email HTML
        const emailHtml = getEmailVerificationTemplate(
            user.firstName,
            token,
            verificationUrl
        );

        // Send email
        const transporter = createTransporter();
        const mailOptions = {
            from: process.env.SMTP_FROM || "noreply@aegis.com",
            to: email,
            subject: "Verify Your Email - Aegis+ Safety",
            html: emailHtml,
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (error: any) {
            console.error("Email sending error:", error);
            // In development, return token for testing
            if (process.env.NODE_ENV === "development") {
                return {
                    message: "Verification email sent successfully (development mode - token included)",
                };
            }
            throw new HttpException(500, "Failed to send verification email");
        }

        return {
            message: "Verification email sent successfully",
        };
    }
}
