import type {Request, Response, NextFunction} from "express";
import {z, ZodObject} from "zod";
import {ValidationError} from "../utils/errors/AppError.js";

export function validate(schema: ZodObject) {
    return (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = z.treeifyError(result.error);
            return next(new ValidationError(errors));
        }

        req.body = result.data;
        next();
    };
}