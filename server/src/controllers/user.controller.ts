import type {Request, Response} from "express";
import {catchAsync} from "../utils/errors/catchAsync.js";
import * as UserService from "../services/user.service.js";
import {sendSuccess} from "../utils/response.js";
import type IdParam from "../types/idParam.js";
import type {UpdateProfileRequest} from "../schemas/user.schemas.js";

export const getAll = catchAsync(async (_req: Request, res: Response) => {
    const users = await UserService.getAll();
    sendSuccess(res, {users});
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.getById(req.user!.id);
    sendSuccess(res, {user});
});

export const getById = catchAsync(async (req: Request<IdParam>, res: Response) => {
    const user = await UserService.getById(req.params.id);
    sendSuccess(res, {user});
});

export const getProposals = catchAsync(async (req: Request<IdParam>, res: Response) => {
    const proposals = await UserService.getProposals(req.params.id);
    sendSuccess(res, {proposals});
});

export const updateMe = catchAsync(async (req: Request<{}, {}, UpdateProfileRequest>, res: Response) => {
    const user = await UserService.updateProfile(req.user!.id, req.body);
    sendSuccess(res, {user});
});
