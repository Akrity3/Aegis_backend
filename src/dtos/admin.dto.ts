import { z } from "zod";

// Admin Create User DTO
export const AdminCreateUserDTO = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    username: z.string().trim().min(1, "Username is required"),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .min(1, "Email is required")
        .regex(
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please provide a valid email"
        ),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["admin", "user"], { error: "Role must be admin or user" }).default("user"),
    status: z.enum(["active", "inactive"], { error: "Status must be active or inactive" }).default("active"),
    phoneNumber: z.string().trim().optional(),
    gender: z.string().trim().optional(),
    profilePicture: z.string().trim().default("default-profile.png"),
});
export type AdminCreateUserDTO = z.infer<typeof AdminCreateUserDTO>;

// Admin Update User DTO
export const AdminUpdateUserDTO = z.object({
    firstName: z.string().trim().min(1, "First name cannot be empty").optional(),
    lastName: z.string().trim().min(1, "Last name cannot be empty").optional(),
    username: z.string().trim().min(1, "Username cannot be empty").optional(),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .regex(
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please provide a valid email"
        )
        .optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    role: z.enum(["admin", "user"], { error: "Role must be admin or user" }).optional(),
    status: z
        .enum(["active", "inactive"], { error: "Status must be active or inactive" })
        .optional(),
    phoneNumber: z.string().trim().optional(),
    gender: z.string().trim().optional(),
});
export type AdminUpdateUserDTO = z.infer<typeof AdminUpdateUserDTO>;
