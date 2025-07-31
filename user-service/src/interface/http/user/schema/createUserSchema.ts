import {z} from "zod";

export const CreateUserSchema = z.object({
    body: z.object({
        email: z
            .string()
            .regex( /^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email format" }),
        password: z.string().min(8),
        name: z.string(),
    }),
});