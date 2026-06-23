import { Request, Response } from "express";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { UserService } from "../services/user.service";
import { JWT_COOKIE_EXPIRE, NODE_ENV } from "../configs/constant";
import { z } from "zod";

const userService = new UserService();

export class UserController {
    async createUser(req: Request, res: Response) {
        try {
            const userData = CreateUserDTO.safeParse(req.body);
            if (!userData.success) {
                // If validation fails, return the error message in the legacy format
                const message = z.prettifyError(userData.error);
                return res.status(400).json({ message });
            }

            const user = await userService.createUser(userData.data);
            const userResponse = user.toObject();
            delete userResponse.password;

            return res.status(201).json({
                success: true,
                data: userResponse,
            });
        } catch (error: any) {
            return res.status(error.status || error.statusCode || 500).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async loginUser(req: Request, res: Response) {
        try {
            const parsedData = LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res
                    .status(400)
                    .json({ message: "Please provide an email and password" });
            }

            const { user, token } = await userService.loginUser(
                parsedData.data
            );

            const options = {
                expires: new Date(
                    Date.now() + JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
                ),
                httpOnly: true,
                sameSite: "strict" as const,
                secure: NODE_ENV === "production",
            };

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
            return res.status(error.status || error.statusCode || 500).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const user = await userService.getUserById(String(req.params.id));
            return res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error: any) {
            return res.status(error.status || error.statusCode || 500).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async uploadProfilePicture(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res
                    .status(400)
                    .json({ message: "Please upload an image file" });
            }

            if (!req.user?._id) {
                return res
                    .status(401)
                    .json({ message: "Not authorized to access this route" });
            }

            const user = await userService.updateProfilePicture(
                String(req.user._id),
                req.file.filename
            );

            const userResponse = user.toObject();
            delete userResponse.password;

            return res.status(200).json({
                success: true,
                data: userResponse,
            });
        } catch (error: any) {
            return res.status(error.status || error.statusCode || 500).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async whoami(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res
                    .status(401)
                    .json({ message: "Not authorized to access this route" });
            }

            const userResponse = req.user.toObject();
            delete userResponse.password;

            return res.status(200).json({
                success: true,
                data: userResponse,
            });
        } catch (error: any) {
            return res.status(error.status || error.statusCode || 500).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res
                    .status(401)
                    .json({ message: "Not authorized to access this route" });
            }

            const parseResult = UpdateUserDTO.safeParse(req.body);
            if (!parseResult.success) {
                const message = z.prettifyError(parseResult.error);
                return res.status(400).json({ message });
            }

            const filename = req.file?.filename;

            const user = await userService.updateUser(
                String(req.user._id),
                parseResult.data,
                filename
            );

            const userResponse = user.toObject();
            delete userResponse.password;

            return res.status(200).json({
                success: true,
                data: userResponse,
            });
        } catch (error: any) {
            return res.status(error.status || error.statusCode || 500).json({
                message: error.message || "Internal Server Error",
            });
        }
    }
}
