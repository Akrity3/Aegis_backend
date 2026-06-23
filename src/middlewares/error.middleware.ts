import { Request, Response, NextFunction } from "express";
import colors from "colors";
import { NODE_ENV } from "../configs/constant";

export const errorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err.stack) {
        console.error(colors.red(err.stack));
    } else {
        console.error(colors.red(String(err)));
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "field";
        return res.status(400).json({
            success: false,
            message: `${field} already exists`,
        });
    }

    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors || {}).map(
            (val: any) => val.message
        );
        return res.status(400).json({
            success: false,
            message: messages.join(", "),
        });
    }

    if (err.name === "CastError") {
        return res.status(404).json({
            success: false,
            message: "Resource not found",
        });
    }

    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token expired",
        });
    }

    const statusCode = err.status || err.statusCode || 500;
    return res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(NODE_ENV === "development" && { stack: err.stack }),
    });
};
