import { z } from "zod";

export const createPatientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z
    .number()
    .int("Age must be a whole number")
    .min(0, "Age must be 0 or greater")
    .max(130, "Age must be 130 or less"),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say"] as const, {
    error: "Please select a valid gender",
  }),
  phone: z
    .string()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long"),
  condition: z.string().min(2, "Condition must be at least 2 characters"),
  admittedAt: z.string().optional(),
});

export const updatePatientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  age: z
    .number()
    .int("Age must be a whole number")
    .min(0, "Age must be 0 or greater")
    .max(130, "Age must be 130 or less")
    .optional(),
  gender: z
    .enum(["Male", "Female", "Other", "Prefer not to say"] as const, {
      error: "Please select a valid gender",
    })
    .optional(),
  phone: z
    .string()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .optional(),
  condition: z.string().min(2, "Condition must be at least 2 characters").optional(),
  admittedAt: z.string().optional(),
});

export type CreatePatientFormData = z.infer<typeof createPatientSchema>;
export type UpdatePatientFormData = z.infer<typeof updatePatientSchema>;
