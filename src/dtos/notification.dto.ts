import { z } from "zod";
import { NOTIFICATION_TYPES } from "../models/notification.model";

export const CreateNotificationDTO = z.object({
    type: z.enum(NOTIFICATION_TYPES, {
        error: "Invalid notification type",
    }),
    title: z
        .string()
        .min(1, "Title is required")
        .max(100, "Title must be at most 100 characters"),
    message: z
        .string()
        .min(1, "Message is required")
        .max(500, "Message must be at most 500 characters"),
});

export type CreateNotificationDTOType = z.infer<typeof CreateNotificationDTO>;

export const MarkAsReadDTO = z.object({
    notificationIds: z.array(z.string()).min(1, "At least one notification ID is required"),
});

export type MarkAsReadDTOType = z.infer<typeof MarkAsReadDTO>;
