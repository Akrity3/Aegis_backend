import { z } from "zod";

export const CreateContactDTO = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must contain 10 digits"),
    relation: z.string().optional().default("Family"),
    isPrimary: z.boolean().optional().default(false),
});

export type CreateContactDTOType = z.infer<typeof CreateContactDTO>;

export const UpdateContactDTO = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50).optional(),
    phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must contain 10 digits").optional(),
    relation: z.string().optional(),
    isPrimary: z.boolean().optional(),
});

export type UpdateContactDTOType = z.infer<typeof UpdateContactDTO>;
