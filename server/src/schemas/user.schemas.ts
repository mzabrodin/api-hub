import { z } from "zod";
import { passwordSchema, usernameSchema, UserRole } from "./common.schemas.js";

export const updateProfileSchema = z.object({
    username: usernameSchema,
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, { error: "Current password is required" }),
    newPassword: passwordSchema,
});

export const updateRoleSchema = z.object({
    role: UserRole,
});

export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;
export type UpdateRoleRequest = z.infer<typeof updateRoleSchema>;
