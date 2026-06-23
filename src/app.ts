import express, { Application, Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import fs from "fs";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import colors from "colors";
import { CORS_ORIGIN, DISABLE_RATE_LIMIT, NODE_ENV } from "./configs/constant";
import userRoutes from "./routes/user.route";
import authRoutes from "./routes/auth.route";
import { errorMiddleware } from "./middlewares/error.middleware";

const app: Application = express();

const uploadDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use((req: Request, res: Response, next: NextFunction) => {
    const skipXssEscape = new Set([
        "email",
        "username",
        "password",
        "profilePicture",
    ]);

    const sanitize = (obj: any): any => {
        if (!obj || typeof obj !== "object") return obj;
        for (const key of Object.keys(obj)) {
            if (key.startsWith("$") || key.includes(".")) {
                delete obj[key];
                continue;
            }
            const val = obj[key];
            if (typeof val === "string") {
                if (
                    !skipXssEscape.has(key) &&
                    !val.includes("@") &&
                    !val.startsWith("http")
                ) {
                    obj[key] = val.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                }
            } else if (val && typeof val === "object") {
                sanitize(val);
            }
        }
        return obj;
    };

    if (req.body) sanitize(req.body);
    if (req.params) sanitize(req.params);

    if (req.query && Object.keys(req.query).length > 0) {
        const sanitizedQuery = sanitize({ ...req.query });
        Object.defineProperty(req, "query", {
            value: sanitizedQuery,
            writable: true,
            configurable: true,
            enumerable: true,
        });
    }

    next();
});

app.use(helmet());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
    origin: function (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
    ) {
        const allowedOrigins = CORS_ORIGIN ? CORS_ORIGIN.split(",") : [];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => DISABLE_RATE_LIMIT,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts, please try again after 15 minutes.",
    skipSuccessfulRequests: true,
    skip: () => DISABLE_RATE_LIMIT,
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message:
        "Too many accounts created from this IP, please try again in an hour.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => DISABLE_RATE_LIMIT,
});

app.use(limiter);

app.use("/api/v1/users/login", authLimiter);
app.post(
    "/api/v1/users",
    registerLimiter,
    (req: Request, res: Response, next: NextFunction) => next()
);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);

app.use((req: Request, res: Response) => {
    return res.status(404).json({ message: "API not found" });
});

app.use(errorMiddleware);

export default app;
