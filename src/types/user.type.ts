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
        .regex(
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please add a valid email"
        ),
    username: z.string().trim().min(1, "Please add a username"),
    password: z
        .string()
        .min(6, "Please add a password of at least 6 characters"),
    phoneNumber: z.string().trim().optional(),
    profilePicture: z.string().trim().default("default-profile.png"),
    role: z.enum(["admin", "user"]).default("user"),
});

export type UserType = z.infer<typeof UserSchema>;
