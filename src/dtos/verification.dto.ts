import { z } from "zod";

export const SendVerificationEmailDTO = z.object({
    email: z
        .string()
        .email("Invalid email address")
        .min(1, "Email is required"),
});

export type SendVerificationEmailDTOType = z.infer<typeof SendVerificationEmailDTO>;

export const VerifyEmailDTO = z.object({
    token: z
        .string()
        .min(1, "Verification token is required"),
});

export type VerifyEmailDTOType = z.infer<typeof VerifyEmailDTO>;
