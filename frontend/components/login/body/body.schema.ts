import z from "zod";

export const userOnboardingSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  gender: z.enum(["Male", "Female", "Other"]),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9+ -]+$/, "Invalid phone number format"),
  dob: z.string().min(1, "Date of birth is required"),
  image: z.string().optional(),
});

export const driverPersonalSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  gender: z.enum(["Male", "Female", "Other"]),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9+ -]+$/, "Invalid phone number format"),
  dob: z.string().min(1, "Date of birth is required"),
  image: z.string().optional(),
});

export const driverVehicleSchema = z.object({
  model: z.string().trim().min(1, "Vehicle model is required"),
  plate_number: z
    .string()
    .trim()
    .min(4, "Vehicle plate number is required")
    .transform((val) => val.toUpperCase()),
  color: z.string().trim().min(1, "Vehicle color is required"),
  license_number: z
    .string()
    .trim()
    .min(5, "Driving license number is required")
    .transform((val) => val.toUpperCase()),
  license_expiration_date: z.string().min(1, "License expiration date is required"),
  insurance_number: z
    .string()
    .trim()
    .min(4, "Insurance policy number is required")
    .transform((val) => val.toUpperCase()),
  insurance_expiration_date: z
    .string()
    .min(1, "Insurance expiration date is required"),
  car_image: z.string().optional(),
});

export type UserOnboardingFormData = z.infer<typeof userOnboardingSchema>;
export type DriverPersonalFormData = z.infer<typeof driverPersonalSchema>;
export type DriverVehicleFormData = z.infer<typeof driverVehicleSchema>;