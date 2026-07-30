import { z } from "zod";

// Refresh token DTO for refresh endpoint
export const RefreshTokenDTO = z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RefreshTokenDTOType = z.infer<typeof RefreshTokenDTO>;

// Logout DTO (if needed for additional data)
export const LogoutDTO = z.object({
    refreshToken: z.string().optional(),
});

export type LogoutDTOType = z.infer<typeof LogoutDTO>;
