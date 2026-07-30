import mongoose from "mongoose";
import { MONGODB_URL } from "../configs/constant";
import colors from "colors";
import { createIndexes } from "./indexes";

export const connectToMongoDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URL);
        console.log(
            colors.yellow.underline.bold(
                `MongoDB connected to : ${conn.connection.host}`
            )
        );

        // Create indexes after successful connection
        await createIndexes();
    } catch (error: any) {
        console.error(
            colors.red.underline.bold(`MongoDB connection error: ${error}`)
        );
        process.exit(1);
    }
};
