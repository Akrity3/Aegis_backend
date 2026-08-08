import { z } from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDTO = UserSchema;
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
    email: z.string().min(1, "Please provide an email and password"),
    password: z.string().min(1, "Please provide an email and password"),
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const UpdateUserDTO = z.object({
    firstName: z.string().trim().min(1, "First name cannot be empty").optional(),
    lastName: z.string().trim().min(1, "Last name cannot be empty").optional(),
    gender: z.string().trim().optional(),
    phoneNumber: z.string().trim().optional().refine(
        (phone) => !phone || /^(?:\+?977)?(9[045678]\d{8})$/.test(phone),
        {
            message: "Must be a valid 10-digit Nepali mobile number (starting with 98, 97, 96, 95, 94, or 90)",
        }
    ),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    currentPassword: z.string().optional(),
});
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;
