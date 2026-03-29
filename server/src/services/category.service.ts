import prisma from "../prisma/client.js";
import {ResourceAlreadyExistsError, ResourceNotFoundError} from "../utils/errors/AppError.js";
import type {CreateCategoryRequest, UpdateCategoryRequest} from "../schemas/category.schemas.js";

export async function getAll() {
    return prisma.category.findMany({orderBy: {name: "asc"}});
}

export async function getById(id: string) {
    const category = await prisma.category.findUnique({where: {id}});
    if (!category) {
        throw new ResourceNotFoundError("Category not found");
    }

    return category;
}

export async function create(data: CreateCategoryRequest) {
    const existing = await prisma.category.findUnique({where: {name: data.name}});
    if (existing) {
        throw new ResourceAlreadyExistsError("Category with this name already exists");
    }

    return prisma.category.create({data});
}

export async function update(id: string, data: UpdateCategoryRequest) {
    const category = await prisma.category.findUnique({where: {id}});
    if (!category) {
        throw new ResourceNotFoundError("Category not found");
    }

    if (data.name && data.name !== category.name) {
        const existing = await prisma.category.findUnique({where: {name: data.name}});
        if (existing) {
            throw new ResourceAlreadyExistsError("Category with this name already exists");
        }
    }

    return prisma.category.update({where: {id}, data});
}

export async function remove(id: string) {
    const category = await prisma.category.findUnique({where: {id}});
    if (!category) {
        throw new ResourceNotFoundError("Category not found");
    }

    await prisma.category.delete({where: {id}});
}
