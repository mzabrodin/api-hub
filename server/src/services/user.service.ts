import prisma from "../prisma/client.js";
import {ResourceNotFoundError} from "../utils/errors/AppError.js";
import type {UpdateProfileRequest, UpdateRoleRequest} from "../schemas/user.schemas.js";

export async function getAll() {
    return prisma.user.findMany({
        select: {id: true, email: true, username: true, role: true, isEmailVerified: true, createdAt: true},
        orderBy: {createdAt: "desc"},
    });
}

export async function getById(id: string) {
    const user = await prisma.user.findUnique({
        where: {id},
        select: {id: true, email: true, username: true, role: true, isEmailVerified: true, createdAt: true},
    });

    if (!user) {
        throw new ResourceNotFoundError("User not found");
    }

    return user;
}

export async function getProposals(userId: string) {
    const user = await prisma.user.findUnique({where: {id: userId}});
    if (!user) {
        throw new ResourceNotFoundError("User not found");
    }

    return prisma.proposal.findMany({
        where: {userId},
        orderBy: {createdAt: "desc"},
    });
}

export async function updateProfile(userId: string, data: UpdateProfileRequest) {
    const user = await prisma.user.findUnique({where: {id: userId}});
    if (!user) {
        throw new ResourceNotFoundError("User not found");
    }

    return prisma.user.update({
        where: {id: userId},
        data,
        select: {id: true, email: true, username: true, role: true, isEmailVerified: true, createdAt: true},
    });
}

export async function updateRole(userId: string, data: UpdateRoleRequest) {
    const user = await prisma.user.findUnique({where: {id: userId}});
    if (!user) {
        throw new ResourceNotFoundError("User not found");
    }

    return prisma.user.update({
        where: {id: userId},
        data: {role: data.role},
        select: {id: true, email: true, username: true, role: true, isEmailVerified: true, createdAt: true},
    });
}
