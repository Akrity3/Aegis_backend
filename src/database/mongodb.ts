import mongoose from "mongoose";
import { MONGODB_URL } from "../configs/constant";
import colors from "colors";

export const connectToMongoDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URL);
        console.log(
            colors.yellow.underline.bold(
                `MongoDB connected to : ${conn.connection.host}`
            )
        );
    } catch (error: any) {
        console.error(
            colors.red.underline.bold(`MongoDB connection error: ${error}`)
        );
        process.exit(1);
    }
};
