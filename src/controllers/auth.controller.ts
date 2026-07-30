import { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../services/auth.service";
import { JWT_COOKIE_EXPIRE, NODE_ENV } from "../configs/constant";
import { ApiResponseHelper } from "../utils/apihelper.util";

const authService = new AuthService();

export class AuthController {
    // POST /api/v1/auth/google
    async googleLogin(req: Request, res: Response) {
        try {
            const { idToken } = req.body;
            
            if (!idToken) {
                return ApiResponseHelper.error(res, "Google ID token is required", 400);
            }

            const { user, token, isNewUser, googleProfile } = await authService.googleLogin(idToken);

            // If user doesn't exist, return Google profile data for registration
            if (isNewUser) {
                return res.status(200).json({
                    success: true,
                    isNewUser: true,
                    googleProfile,
                });
            }

            const options = {
                expires: new Date(
                    Date.now() + JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
                ),
                httpOnly: true,
                sameSite: "strict" as const,
                secure: NODE_ENV === "production",
            };

            if (!user) {
                return ApiResponseHelper.error(res, "User not found", 404);
            }

            const userResponse = user.toObject();
            delete userResponse.password;

            return res
                .status(200)
                .cookie("token", token, options)
                .cookie("auth_token", token, options)
                .json({
                    success: true,
                    token,
                    data: userResponse,
                });
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Google authentication failed",
                error.status || error.statusCode || 500
            );
        }
    }

    // POST /api/v1/auth/forgot-password
    async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body;
            
            if (!email) {
                return ApiResponseHelper.error(res, "Email is required", 400);
            }

            const emailSchema = z.string().email("Invalid email format");
            const validatedEmail = emailSchema.parse(email);

            await authService.forgotPassword(validatedEmail);

            return ApiResponseHelper.success(
                res,
                null,
                "If an account exists with this email, a password reset link has been sent."
            );
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Failed to process request",
                error.status || error.statusCode || 500
            );
        }
    }

    // POST /api/v1/auth/reset-password
    async resetPassword(req: Request, res: Response) {
        try {
            const { token, newPassword } = req.body;
            
            if (!token || !newPassword) {
                return ApiResponseHelper.error(res, "Token and new password are required", 400);
            }

            const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
            const validatedPassword = passwordSchema.parse(newPassword);

            await authService.resetPassword(token, validatedPassword);

            return ApiResponseHelper.success(
                res,
                null,
                "Password reset successfully. Please login with your new password."
            );
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Failed to reset password",
                error.status || error.statusCode || 500
            );
        }
    }
}
