import type {Request, Response, NextFunction} from "express";
import {UserRole} from "../prisma/generated/enums.js";
import {ForbiddenError, UnauthorizedError} from "../utils/errors/AppError.js";

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
    if (!req.user) {
        return next(new UnauthorizedError("Authentication required"));
    }

    if (req.user.role !== UserRole.ADMIN) {
        return next(new ForbiddenError("Admin privileges required"));
    }

    next();
}

export default requireAdmin;