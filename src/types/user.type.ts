import { z } from "zod";

export const UserSchema = z.object({
    firstName: z.string().trim().min(1, "Please add a first name"),
    lastName: z.string().trim().min(1, "Please add a last name"),
    gender: z.string().trim().optional(),
    email: z
        .string()
        .trim()
        .lowercase()
        .min(1, "Please add an email")
        .email("Please add a valid email")
        .refine((email) => email.endsWith("@gmail.com"), {
            message: "Only Gmail addresses are allowed",
        }),
    username: z.string().trim().min(1, "Please add a username"),
    password: z
        .string()
        .min(6, "Please add a password of at least 6 characters"),
    phoneNumber: z.string().trim().optional().refine(
        (phone) => !phone || /^(?:\+?977)?(9[045678]\d{8})$/.test(phone),
        {
            message: "Must be a valid 10-digit Nepali mobile number (starting with 98, 97, 96, 95, 94, or 90)",
        }
    ),
    profilePicture: z.string().trim().default("default-profile.png"),
    role: z.enum(["admin", "user"]).default("user"),
    status: z.enum(["active", "inactive"]).optional().default("active"),
});

export type UserType = z.infer<typeof UserSchema>;
