import type {Request, Response, NextFunction} from "express";
import {z, ZodType, ZodObject, ZodRawShape} from "zod";
import {ValidationError} from "../utils/errors/AppError.js";

export function requestSchema(schema: {
    body?: ZodType;
    query?: ZodType;
    params?: ZodType;
}): ZodObject<ZodRawShape> {
    return z.object({
        ...(schema.body && {body: schema.body}),
        ...(schema.query && {query: schema.query}),
        ...(schema.params && {params: schema.params}),
    });
}

export function validate(schema: ZodObject<ZodRawShape>) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const result = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        if (!result.success) {
            next(new ValidationError(z.treeifyError(result.error)));
            return;
        }

        if (result.data.body) {
            req.body = result.data.body;
        }

        if (result.data.query) {
            req.query = result.data.query as typeof req.query;
        }

        if (result.data.params) {
            req.params = result.data.params as typeof req.params;
        }

        next();
    };
}