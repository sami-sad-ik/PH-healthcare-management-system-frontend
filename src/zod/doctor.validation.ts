import { z } from "zod";

export const createDoctorZodSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  doctor: z.object({
    name: z.string().min(1, "Name is required").max(20, "Name must be less than 20 characters"),
    email: z.email("Invalid email address"),
    contactNumber: z.string().min(11, "Contact number must be at least 11 digits"),
    // profilePhoto: z.string().min(1, "Profile photo is required"),
    address: z.string().optional(),
    registrationNumber: z.string().min(1, "Registration number is required"),
    qualification: z.string().min(1, "Qualification is required"),
    experience: z.number().int("Experience must be an integer").nonnegative("Experience cannot be negative").optional(),
    gender: z.enum(["MALE", "FEMALE"], "Gender can be either MALE or FEMALE"),
    appointmentFee: z.number().nonnegative("Appointment fee cannot be negative"),
    currentWorkingPlace: z.string().min(1, "Current working place is required"),
    designation: z.string().min(1, "Designation is required"),
  }),
  specialities: z.array(z.uuid(), "Specialities must be an array of UUIDs").min(1, "At least one speciality is required"),
});

export type ICreateDoctorPayload = z.infer<typeof createDoctorZodSchema>;

export const updateDoctorZodSchema = z.object({
  name: z.string().max(20, "Name must be less than 20 characters").optional(),
  contactNumber: z
    .string()
    .min(11, "Contact number must be at least 11 digits")
    .optional(),
  address: z.string().optional(),
  registrationNumber: z.string().optional(),
  qualification: z.string().optional(),
  experience: z.number().int("Experience must be an integer").nonnegative().optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  appointmentFee: z.number().nonnegative().optional(),
  currentWorkingPlace: z.string().optional(),
  designation: z.string().optional(),
  specialities: z.array(z.uuid()).optional(),
});

export type IUpdateDoctorPayload = z.infer<typeof updateDoctorZodSchema>;
