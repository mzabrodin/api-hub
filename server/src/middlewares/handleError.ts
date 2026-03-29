import {Request, Response, NextFunction} from "express";
import CONFIG from "../config.js";
import {AppError, ValidationError} from "../utils/errors/AppError.js";

export const handleError = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: "error",
            message: err.message,
            ...(err instanceof ValidationError && { details: err.details }),
            ...(CONFIG.nodeEnv === "dev" && { stack: err.stack }),
        });
    }

    console.error("Unexpected error: ", err);

    return res.status(500).json({
        status: "error",
        message: "Something went wrong",
        ...(CONFIG.nodeEnv === "dev" && {stack: err.stack}),
    });
};