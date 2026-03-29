import type {Request, Response} from "express";
import {catchAsync} from "../utils/errors/catchAsync.js";
import * as ApiService from "../services/api.service.js";
import {sendCreated, sendNoContent, sendSuccess, sendPaginated, buildPagination} from "../utils/response.js";
import {UserRole} from "../prisma/generated/enums.js";
import type IdParam from "../types/idParam.js";
import type {CreateApiRequest, UpdateApiRequest, ToggleApiRequest, ApiQueryRequest} from "../schemas/api.schemas.js";

export const getAll = catchAsync(async (req: Request<{}, {}, {}, ApiQueryRequest>, res: Response) => {
    const isAdmin = req.user?.role === UserRole.ADMIN;
    const {apis, total, page, limit} = await ApiService.getAll(req.query, isAdmin);
    sendPaginated(res, apis, buildPagination(page, limit, total));
});

export const getById = catchAsync(async (req: Request<IdParam>, res: Response) => {
    const api = await ApiService.getById(req.params.id);
    sendSuccess(res, {api});
});

export const create = catchAsync(async (req: Request<{}, {}, CreateApiRequest>, res: Response) => {
    const api = await ApiService.create(req.body);
    sendCreated(res, {api});
});

export const update = catchAsync(async (req: Request<IdParam, {}, UpdateApiRequest>, res: Response) => {
    const api = await ApiService.update(req.params.id, req.body);
    sendSuccess(res, {api});
});

export const toggle = catchAsync(async (req: Request<IdParam, {}, ToggleApiRequest>, res: Response) => {
    const api = await ApiService.toggle(req.params.id, req.body);
    sendSuccess(res, {api});
});

export const remove = catchAsync(async (req: Request<IdParam>, res: Response) => {
    await ApiService.remove(req.params.id);
    sendNoContent(res);
});
