import z from "zod";

export const registerSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    mobileNumber: z.string().optional(),
    password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
});

export const captainRegisterSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    mobileNumber: z.string().min(1, "Mobile number is required"),
    password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
    agreeTerms: z.boolean().refine((val) => val === true, {
        message: "You must agree to the Driver Terms and Privacy Policy",
    }),
});

export const captainLoginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
});