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
        (phone) => !phone || /^\d{10}$/.test(phone),
        {
            message: "Phone number must contain 10 digits",
        }
    ),
    profilePicture: z.string().trim().default("default-profile.png"),
    role: z.enum(["admin", "user"]).default("user"),
    status: z.enum(["active", "inactive"]).optional().default("active"),
});

export type UserType = z.infer<typeof UserSchema>;
