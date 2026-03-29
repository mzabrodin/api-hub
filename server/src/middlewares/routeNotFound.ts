import {Request,Response, NextFunction} from "express";
import {RouteNotFoundError} from "../utils/errors/AppError.js";

export function routeNotFound(_req: Request, _res: Response, next: NextFunction) {
    next(new RouteNotFoundError);
}

export default routeNotFound;