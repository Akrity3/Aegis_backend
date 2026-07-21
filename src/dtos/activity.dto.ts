import { z } from "zod";
import { ACTIVITY_TYPES } from "../models/activity.model";

export const CreateActivityDTO = z.object({
    type: z.enum(ACTIVITY_TYPES, {
        error: "Invalid activity type",
    }),
    description: z
        .string()
        .min(1, "Description is required")
        .max(500, "Description must be at most 500 characters"),
    metadata: z.record(z.string(), z.any()).optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
});

export type CreateActivityDTOType = z.infer<typeof CreateActivityDTO>;
