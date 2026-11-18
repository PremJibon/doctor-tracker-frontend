import { z } from "zod";

export const createDoctorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Doctor name is required")
    .min(2, "Name must be at least 2 characters"),
  specialization: z
    .string()
    .trim()
    .min(1, "Specialization is required")
    .min(2, "Specialization must be at least 2 characters"),
  hospital: z
    .string()
    .trim()
    .min(1, "Hospital name is required")
    .min(2, "Hospital name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .min(5, "Phone number must be at least 5 digits"),
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Invalid email format")
    .toLowerCase(),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;

export const addDoctorPatientSchema = z.object({
  name: z.string().trim().min(1, "Patient name is required"),
  age: z.number().min(0, "Age must be positive").max(130, "Please enter a valid age"),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say"], {
    message: "Please select a valid gender",
  }),
  phone: z.string().trim().min(5, "Phone number must be at least 5 characters"),
  condition: z.string().trim().min(1, "Medical condition / diagnosis is required"),
  admittedAt: z.string().optional(),
});

export type AddDoctorPatientInput = z.infer<typeof addDoctorPatientSchema>;
