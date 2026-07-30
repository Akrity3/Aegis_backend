import { z } from "zod";
import { INCIDENT_CATEGORIES } from "../models/incident.model";

export const CreateIncidentDTO = z.object({
    category: z.enum(INCIDENT_CATEGORIES, {
        error: "Invalid incident category",
    }),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(500, "Description must be at most 500 characters"),
    latitude: z
        .number()
        .refine((v) => !isNaN(v), { message: "Latitude must be a valid number" }),
    longitude: z
        .number()
        .refine((v) => !isNaN(v), { message: "Longitude must be a valid number" }),
    address: z.string().optional(),
});

export type CreateIncidentDTOType = z.infer<typeof CreateIncidentDTO>;

export const UpdateIncidentDTO = z.object({
    category: z.enum(INCIDENT_CATEGORIES, {
        error: "Invalid incident category",
    }).optional(),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(500, "Description must be at most 500 characters")
        .optional(),
    latitude: z
        .number()
        .refine((v) => !isNaN(v), { message: "Latitude must be a valid number" })
        .optional(),
    longitude: z
        .number()
        .refine((v) => !isNaN(v), { message: "Longitude must be a valid number" })
        .optional(),
    address: z.string().optional(),
});

export type UpdateIncidentDTOType = z.infer<typeof UpdateIncidentDTO>;
