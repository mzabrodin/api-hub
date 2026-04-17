import {Request, Response, NextFunction} from "express";
import CONFIG from "../config.js";
import {AppError, ValidationError} from "../utils/errors/AppError.js";

export function handleError(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err instanceof ValidationError && {details: err.details}),
            ...(CONFIG.nodeEnv === "dev" && {stack: err.stack}),
        });
        return;
    }

    console.error("Unexpected error: ", err);

    res.status(500).json({
        success: false,
        message: "Something went wrong",
        ...(CONFIG.nodeEnv === "dev" && {stack: err.stack}),
    });
}

export default handleError;