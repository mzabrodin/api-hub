import {z} from "zod";

// https://stackoverflow.com/a/21456918
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const usernameRegex = /^[a-zA-Z0-9_]+$/;

export function processBoolean(input: unknown): boolean | undefined {
    if (input === "true") return true;
    if (input === "false") return false;
    return undefined;
}

export const UserRole = z.enum(["ADMIN", "USER"], {error: "Role must be one of ADMIN, USER"});

export const ProposalStatus = z.enum(["PENDING", "ACCEPTED", "REJECTED"], {
    error: "Proposal status must be one of PENDING, ACCEPTED, REJECTED",
});

export const AuthType = z.enum(["NONE", "API_KEY", "OAUTH"], {
    error: "Auth type must be one of NONE, API_KEY, OAUTH",
});

export const CorsStatus = z.enum(["AVAILABLE", "UNAVAILABLE", "UNKNOWN"], {
    error: "CORS status must be one of AVAILABLE, UNAVAILABLE, UNKNOWN",
});

export const passwordSchema = z
    .string()
    .min(8, {error: "Password must be at least 8 characters"})
    .max(100, {error: "Password must be at most 100 characters"})
    .regex(passwordRegex, {
        error: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    });

export const usernameSchema = z
    .string()
    .min(2, {error: "Username must be at least 2 characters"})
    .max(50, {error: "Username must be at most 50 characters"})
    .trim()
    .regex(usernameRegex, {error: "Username may only contain letters, digits, and underscores"});

export const apiEntryBaseSchema = z.object({
    name: z
        .string()
        .min(2, {error: "Name must be at least 2 characters"})
        .max(100, {error: "Name must be at most 100 characters"})
        .trim(),
    description: z
        .string()
        .min(10, {error: "Description must be at least 10 characters"})
        .max(500, {error: "Description must be at most 500 characters"})
        .trim(),
    url: z.url({error: "Must be a valid URL"}),
    categoryId: z.uuid({error: "Invalid category ID"}),
    isHttps: z.boolean(),
    corsStatus: CorsStatus,
    isFree: z.boolean(),
    authType: AuthType,
});

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const uuidParamSchema = z.object({
    id: z.uuid({error: "Invalid ID"}),
});
