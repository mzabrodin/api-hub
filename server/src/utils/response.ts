import type { Response } from "express";

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
    res.status(statusCode).json({ success: true, data });
}

export function sendPaginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationInfo,
): void {
    res.status(200).json({ success: true, data, pagination });
}

export function sendCreated<T>(res: Response, data: T): void {
    sendSuccess(res, data, 201);
}

export function sendNoContent(res: Response): void {
    res.status(204).send();
}

export function buildPagination(page: number, limit: number, total: number): PaginationInfo {
    return { page, limit, total, totalPages: Math.ceil(total / limit) };
}
