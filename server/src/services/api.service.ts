import prisma from "../prisma/client.js";
import {ResourceNotFoundError} from "../utils/errors/AppError.js";
import type {CreateApiRequest, UpdateApiRequest, ToggleApiRequest, ApiQueryRequest} from "../schemas/api.schemas.js";

export async function getAll(query: ApiQueryRequest, isAdmin = false) {
    const {page, limit, search, categoryId, authType, isHttps, corsStatus, isFree} = query;

    const where = {
        ...(search && {
            OR: [
                {name: {contains: search, mode: "insensitive" as const}},
                {description: {contains: search, mode: "insensitive" as const}},
            ],
        }),
        ...(categoryId && {categoryId}),
        ...(authType && {authType}),
        ...(isHttps !== undefined && {isHttps}),
        ...(corsStatus && {corsStatus}),
        ...(isFree !== undefined && {isFree}),
        ...(!isAdmin && {isActive: true}),
    };

    const [apis, total] = await Promise.all([
        prisma.api.findMany({
            where,
            include: {category: {select: {id: true, name: true}}},
            orderBy: {name: "asc"},
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.api.count({where}),
    ]);

    return {apis, total, page, limit};
}

export async function getById(id: string) {
    const api = await prisma.api.findUnique({
        where: {id},
        include: {category: {select: {id: true, name: true}}},
    });

    if (!api) {
        throw new ResourceNotFoundError("API not found");
    }

    return api;
}

export async function create(data: CreateApiRequest) {
    return prisma.api.create({
        data,
        include: {category: {select: {id: true, name: true}}},
    });
}

export async function update(id: string, data: UpdateApiRequest) {
    const api = await prisma.api.findUnique({where: {id}});
    if (!api) {
        throw new ResourceNotFoundError("API not found");
    }

    return prisma.api.update({
        where: {id},
        data,
        include: {category: {select: {id: true, name: true}}},
    });
}

export async function toggle(id: string, data: ToggleApiRequest) {
    const api = await prisma.api.findUnique({where: {id}});
    if (!api) {
        throw new ResourceNotFoundError("API not found");
    }

    return prisma.api.update({
        where: {id},
        data: {isActive: data.isActive},
        include: {category: {select: {id: true, name: true}}},
    });
}

export async function remove(id: string) {
    const api = await prisma.api.findUnique({where: {id}});
    if (!api) {
        throw new ResourceNotFoundError("API not found");
    }

    await prisma.api.delete({where: {id}});
}
