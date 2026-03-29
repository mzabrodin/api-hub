import type {Request, Response} from "express";
import {catchAsync} from "../utils/errors/catchAsync.js";
import * as AuthService from "../services/auth.service.js";
import {sendCreated, sendNoContent, sendSuccess} from "../utils/response.js";

export const register = catchAsync(async (req: Request, res: Response) => {
    const user = await AuthService.register(req.body);
    sendCreated(res, {user});
});

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
    await AuthService.verifyEmail(req.body.token);
    sendNoContent(res);
});

export const login = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    sendSuccess(res, result);
});

export const logout = catchAsync(async (req: Request, res: Response) => {
    await AuthService.logout(req.user!.id);
    sendNoContent(res);
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.refresh(req.body.refreshToken);
    sendSuccess(res, result);
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
    await AuthService.forgotPassword(req.body.email);
    sendNoContent(res);
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
    await AuthService.resetPassword(req.body.token, req.body.password);
    sendNoContent(res);
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
    await AuthService.changePassword(req.user!.id, req.body);
    sendNoContent(res);
});
