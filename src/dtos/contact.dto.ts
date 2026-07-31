import { z } from "zod";

// Helper to preprocess null values into undefined or defaults
const nullableField = <T extends z.ZodTypeAny>(schema: T) =>
    z.preprocess((val) => (val === null ? undefined : val), schema);

export const CreateContactDTO = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(50),
    phoneNumber: z.string().trim().regex(
        /^(?:\+?977)?(9[045678]\d{8})$/,
        "Please enter a valid 10-digit Nepali mobile number starting with 98, 97, 96, 95, 94, or 90"
    ),
    relation: z.preprocess(
        (val) => (val === null || val === "" ? "Family" : val),
        z.string().optional().default("Family")
    ),
    isPrimary: z.preprocess(
        (val) => (val === null ? false : val),
        z.boolean().optional().default(false)
    ),
    avatarUrl: nullableField(z.string().optional()),
    isEmergencyContact: z.preprocess(
        (val) => (val === null ? true : val),
        z.boolean().optional().default(true)
    ),
});

export type CreateContactDTOType = z.infer<typeof CreateContactDTO>;

export const UpdateContactDTO = z.object({
    name: nullableField(z.string().trim().min(2, "Name must be at least 2 characters").max(50).optional()),
    phoneNumber: nullableField(
        z.string().trim().regex(
            /^(?:\+?977)?(9[045678]\d{8})$/,
            "Please enter a valid 10-digit Nepali mobile number starting with 98, 97, 96, 95, 94, or 90"
        ).optional()
    ),
    relation: nullableField(z.string().optional()),
    isPrimary: nullableField(z.boolean().optional()),
    avatarUrl: nullableField(z.string().optional()),
    isEmergencyContact: nullableField(z.boolean().optional()),
});

export type UpdateContactDTOType = z.infer<typeof UpdateContactDTO>;

export const RespondContactDTO = z.object({
    status: z.enum(["accepted", "rejected"]),
});

export type RespondContactDTOType = z.infer<typeof RespondContactDTO>;
