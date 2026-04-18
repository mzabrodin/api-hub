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

export function validateSchema(schema: ZodObject<ZodRawShape>) {
    return function validationMiddleware(req: Request, _res: Response, next: NextFunction): void {
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
            Object.defineProperty(req, "query", {
                value: result.data.query,
                writable: true,
                enumerable: true,
                configurable: true,
            });
        }

        if (result.data.params) {
            Object.defineProperty(req, "params", {
                value: result.data.params,
                writable: true,
                enumerable: true,
                configurable: true,
            });
        }

        next();
    };
}

export default validateSchema;