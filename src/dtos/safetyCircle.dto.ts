import { z } from "zod";

export const CreateSafetyCircleDTO = z.object({
    contactId: z.string().min(1, "Contact ID is required"),
    status: z.enum(["active", "inactive", "pending"], {
        error: "Invalid status",
    }).optional(),
});

export type CreateSafetyCircleDTOType = z.infer<typeof CreateSafetyCircleDTO>;

export const UpdateSafetyCircleDTO = z.object({
    status: z.enum(["active", "inactive", "pending"], {
        error: "Invalid status",
    }),
    lastLocation: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }).optional(),
});

export type UpdateSafetyCircleDTOType = z.infer<typeof UpdateSafetyCircleDTO>;
