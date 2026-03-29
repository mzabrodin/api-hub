import {z} from "zod";
import {passwordSchema, usernameSchema} from "./common.schemas.js";

export const registerSchema = z.object({
    email: z.email({error: "Invalid email address"}).toLowerCase(),
    password: passwordSchema,
    username: usernameSchema,
});

export const loginSchema = z.object({
    email: z.email({error: "Invalid email address"}).toLowerCase(),
    password: z.string().min(1, {error: "Password is required"}),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, {error: "Refresh token is required"}),
});

export const verifyEmailSchema = z.object({
    token: z.string().min(1, {error: "Verification token is required"}),
});

export const forgotPasswordSchema = z.object({
    email: z.email({error: "Invalid email address"}).toLowerCase(),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, {error: "Reset token is required"}),
    password: passwordSchema,
});

export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;
export type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
