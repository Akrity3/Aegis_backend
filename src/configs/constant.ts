import dotenv from "dotenv";

dotenv.config();

export const PORT: number = Number(process.env.PORT) || 3000;
export const NODE_ENV: string = process.env.NODE_ENV || "development";
export const MONGODB_URL: string =
    process.env.LOCAL_DATABASE_URI ||
    process.env.MONGODB_URL ||
    "mongodb://127.0.0.1:27017/aegis";
export const SECRET_KEY: string =
    process.env.JWT_SECRET ||
    process.env.SECRET_KEY ||
    "aegis_dev_jwt_secret_change_in_production_7245635e8156911a";
export const JWT_EXPIRE: string = process.env.JWT_EXPIRE || "30d";
export const JWT_COOKIE_EXPIRE: number =
    Number(process.env.JWT_COOKIE_EXPIRE) || 30;
export const CORS_ORIGIN: string =
    process.env.CORS_ORIGIN || "http://localhost:3000,http://localhost:3001";
export const DISABLE_RATE_LIMIT: boolean =
    process.env.DISABLE_RATE_LIMIT === "true";