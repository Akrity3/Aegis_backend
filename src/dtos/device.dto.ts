import { z } from "zod";

export const RegisterDeviceDTO = z.object({
    token: z
        .string()
        .min(1, "Device token is required"),
    platform: z
        .enum(["ios", "android", "web"], {
            message: "Platform must be ios, android, or web",
        }),
    deviceName: z
        .string()
        .optional(),
});

export type RegisterDeviceDTOType = z.infer<typeof RegisterDeviceDTO>;

export const RemoveDeviceDTO = z.object({
    deviceId: z
        .string()
        .min(1, "Device ID is required"),
});

export type RemoveDeviceDTOType = z.infer<typeof RemoveDeviceDTO>;
