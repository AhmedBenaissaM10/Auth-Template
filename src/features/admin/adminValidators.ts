import {z} from 'zod';

export const addUserSchema = z.object({
    name: z.string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(32, "Name must be at most 32 characters")
    .trim(),
    
    email: z.email("Please enter a valid email")
    .trim()
    .toLowerCase(),
    password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least  one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
    role: z.enum(["ADMIN", "USER"], "Role must be either ADMIN or USER")
})
export const updateUserSchema = addUserSchema.partial().refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });


