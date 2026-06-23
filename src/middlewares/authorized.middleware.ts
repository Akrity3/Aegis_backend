import { Request, Response, NextFunction } from "express";
import { SECRET_KEY } from "../configs/constant";
import jwt from "jsonwebtoken";
import { IUser } from "../models/user.model";
import { UserMongoRepository } from "../repositories/user.repository";

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

const userRepository = new UserMongoRepository();

export const authorizedMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        let token = req.cookies?.auth_token || req.cookies?.token;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        if (!token) {
            return res
                .status(401)
                .json({ message: "Not authorized to access this route" });
        }

        const decodedToken = jwt.verify(token, SECRET_KEY) as { id: string };
        if (!decodedToken || !decodedToken.id) {
            return res
                .status(401)
                .json({ message: "Not authorized to access this route" });
        }

        const user = await userRepository.getUserById(decodedToken.id);
        if (!user) {
            return res
                .status(401)
                .json({ message: "Not authorized to access this route" });
        }

        req.user = user;
        return next();
    } catch (err: any) {
        return res
            .status(401)
            .json({ message: "Not authorized to access this route" });
    }
};

export const adminMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return res
                .status(401)
                .json({ message: "Not authorized to access this route" });
        }
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden not admin" });
        }
        return next();
    } catch (err: any) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
