import { OAuth2Client } from "google-auth-library";
import { UserMongoRepository } from "../repositories/user.repository";
import { PasswordResetMongoRepository } from "../repositories/passwordReset.repository";
import { HttpException } from "../exceptions/http-exception";
import { IUser } from "../models/user.model";
import crypto from "crypto";
import nodemailer from "nodemailer";

const userRepository = new UserMongoRepository();
const passwordResetRepository = new PasswordResetMongoRepository();

export class AuthService {
    private googleClient: OAuth2Client;

    constructor() {
        this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }

    async verifyGoogleToken(idToken: string): Promise<any> {
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            return ticket.getPayload();
        } catch (error) {
            throw new HttpException(401, "Invalid Google token");
        }
    }

    async googleLogin(idToken: string): Promise<{ user: IUser | null; token: string; isNewUser: boolean; googleProfile?: any }> {
        const payload = await this.verifyGoogleToken(idToken);
        
        if (!payload.email) {
            throw new HttpException(400, "Google account must have an email");
        }

        let user = await userRepository.getUserByEmail(payload.email);
        let isNewUser = false;

        if (!user) {
            // Return Google profile data for registration
            return {
                user: null,
                token: "",
                isNewUser: true,
                googleProfile: {
                    email: payload.email,
                    firstName: payload.given_name || "",
                    lastName: payload.family_name || "",
                    profilePicture: payload.picture,
                },
            };
        } else {
            // Update user if not verified
            if (!user.isEmailVerified) {
                user.isEmailVerified = true;
                user.verifiedAt = new Date();
                await user.save();
            }
        }

        const token = user.getSignedJwtToken();
        return { user, token, isNewUser };
    }

    async forgotPassword(email: string): Promise<void> {
        const user = await userRepository.getUserByEmail(email);
        
        // Always generate token even if user doesn't exist (security through obscurity)
        const token = crypto.randomBytes(32).toString('hex');
        await passwordResetRepository.createPasswordReset(email, token);

        // Only send email if user exists
        if (user) {
            await this.sendPasswordResetEmail(email, token);
        }
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const resetRequest = await passwordResetRepository.findByToken(token);
        
        if (!resetRequest) {
            throw new HttpException(400, "Invalid or expired reset token");
        }

        if (resetRequest.used) {
            throw new HttpException(400, "Reset token has already been used");
        }

        const user = await userRepository.getUserByEmail(resetRequest.email);
        if (!user) {
            throw new HttpException(404, "User not found");
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Mark token as used
        await passwordResetRepository.markAsUsed(token);
    }

    private generateUsernameFromEmail(email: string): string {
        const localPart = email.split('@')[0];
        const cleanUsername = localPart.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        return cleanUsername || `user_${Date.now()}`;
    }

    private async sendPasswordResetEmail(email: string, token: string): Promise<void> {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
        
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@aegis.com',
            to: email,
            subject: 'Password Reset Request - Aegis+',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #16A34A;">Password Reset Request</h2>
                    <p>You requested a password reset for your Aegis+ account.</p>
                    <p>Click the button below to reset your password:</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #16A34A; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                        Reset Password
                    </a>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #6B7280;">${resetUrl}</p>
                    <p style="color: #6B7280; font-size: 14px;">This link will expire in 30 minutes.</p>
                    <p style="color: #6B7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                </div>
            `,
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending password reset email:', error);
            // Don't throw error to avoid revealing email existence
        }
    }
}
