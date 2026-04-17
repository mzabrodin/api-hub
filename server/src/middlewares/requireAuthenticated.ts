import jwt from "jsonwebtoken";
import type {Request, Response, NextFunction} from "express";
import CONFIG from "../config.js";
import type JWT from "../types/jwt.js";
import {UnauthorizedError} from "../utils/errors/AppError.js";

export function requireAuthenticated(req: Request, _res: Response, next: NextFunction) {
    const {authorization} = req.headers;

    if (!authorization) {
        return next(new UnauthorizedError("Authorization token is required"));
    }

    if (!authorization.startsWith("Bearer ")) {
        return next(new UnauthorizedError("Authorization token must be a Bearer token"));
    }

    const accessToken = authorization.slice(7);

    jwt.verify(accessToken, CONFIG.jwtAccessSecret, (err, decoded) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                return next(new UnauthorizedError("Access token has expired"));
            }
            return next(new UnauthorizedError("Access token is invalid"));
        }

        req.user = decoded as JWT;
        next();
    });
}

export default requireAuthenticated;