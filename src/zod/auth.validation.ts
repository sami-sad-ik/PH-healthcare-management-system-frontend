import { z } from "zod";

export const loginZodSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at most 8 characters" })
    // .regex(
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    //   {
    //     message:
    //       "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    //   },
    // ),
});

export type ILoginPayload = z.infer<typeof loginZodSchema>;
