import { z } from "zod";

export const TriggerAlertDTO = z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional(),
});

export type TriggerAlertDTOType = z.infer<typeof TriggerAlertDTO>;

export const ResolveAlertDTO = z.object({
    alertId: z.string().min(1, "Alert ID cannot be empty"),
});

export type ResolveAlertDTOType = z.infer<typeof ResolveAlertDTO>;
