import {z} from "zod";

export const createCategorySchema = z.object({
    name: z
        .string()
        .min(2, {error: "Name must be at least 2 characters"})
        .max(100, {error: "Name must be at most 100 characters"})
        .trim(),
    description: z
        .string()
        .max(500, {error: "Description must be at most 500 characters"})
        .trim()
        .optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryRequest = z.infer<typeof createCategorySchema>;
export type UpdateCategoryRequest = z.infer<typeof updateCategorySchema>;
