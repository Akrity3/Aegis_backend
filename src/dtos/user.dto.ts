import { z } from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDTO = UserSchema;
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
    email: z.string().min(1, "Please provide an email and password"),
    password: z.string().min(1, "Please provide an email and password"),
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;
