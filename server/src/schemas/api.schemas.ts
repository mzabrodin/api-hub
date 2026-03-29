import {z} from "zod";
import {apiEntryBaseSchema, AuthType, paginationSchema, processBoolean} from "./common.schemas.js";

export const createApiSchema = apiEntryBaseSchema;
export const updateApiSchema = apiEntryBaseSchema.partial();
export const toggleApiSchema = z.object({isActive: z.boolean()});

export const apiQuerySchema = paginationSchema.extend({
    search: z.string().trim().optional(),
    categoryId: z.uuid({error: "Invalid category ID"}).optional(),
    authType: AuthType.optional(),
    isHttps: z.preprocess(processBoolean, z.boolean()).optional(),
    isCors: z.preprocess(processBoolean, z.boolean()).optional(),
    isFree: z.preprocess(processBoolean, z.boolean()).optional(),
});

export type CreateApiRequest = z.infer<typeof createApiSchema>;
export type UpdateApiRequest = z.infer<typeof updateApiSchema>;
export type ToggleApiRequest = z.infer<typeof toggleApiSchema>;
export type ApiQueryRequest = z.infer<typeof apiQuerySchema>;