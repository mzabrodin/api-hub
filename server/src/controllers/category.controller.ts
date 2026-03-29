import type {Request, Response} from "express";
import {catchAsync} from "../utils/errors/catchAsync.js";
import * as CategoryService from "../services/category.service.js";
import {sendCreated, sendNoContent, sendSuccess} from "../utils/response.js";
import type IdParam from "../types/idParam.js";
import type {CreateCategoryRequest, UpdateCategoryRequest} from "../schemas/category.schemas.js";

export const getAll = catchAsync(async (_req: Request, res: Response) => {
    const categories = await CategoryService.getAll();
    sendSuccess(res, {categories});
});

export const getById = catchAsync(async (req: Request<IdParam>, res: Response) => {
    const category = await CategoryService.getById(req.params.id);
    sendSuccess(res, {category});
});

export const create = catchAsync(async (req: Request<{}, {}, CreateCategoryRequest>, res: Response) => {
    const category = await CategoryService.create(req.body);
    sendCreated(res, {category});
});

export const update = catchAsync(async (req: Request<IdParam, {}, UpdateCategoryRequest>, res: Response) => {
    const category = await CategoryService.update(req.params.id, req.body);
    sendSuccess(res, {category});
});

export const remove = catchAsync(async (req: Request<IdParam>, res: Response) => {
    await CategoryService.remove(req.params.id);
    sendNoContent(res);
});