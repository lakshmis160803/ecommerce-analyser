import { z } from "zod";

// Create User / Signup
export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters"),

  email: z
    .email("Invalid email address")
    .transform((email) => email.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password cannot exceed 20 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[@$!%*?&]/,
      "Password must contain at least one special character"
    ),

  role: z
    .enum(["superadmin", "admin", "viewer"])
    .optional(),

  status: z
    .enum(["active", "inactive"])
    .optional(),
});

// Update User
export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .optional(),

  email: z
    .email()
    .transform((email) => email.toLowerCase())
    .optional(),

  role: z
    .enum(["superadmin", "admin", "viewer"])
    .optional(),

  status: z
    .enum(["active", "inactive"])
    .optional(),
});

// Update Role Only
export const updateRoleSchema = z.object({
  role: z.enum(["superadmin", "admin", "viewer"]),
});

// Update Status Only
export const updateStatusSchema = z.object({
  status: z.enum(["active", "inactive"]),
});