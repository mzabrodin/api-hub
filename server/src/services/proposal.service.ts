import prisma from "../prisma/client.js";
import {ProposalStatus} from "../prisma/generated/enums.js";
import {ForbiddenError, InvalidActionError, ResourceNotFoundError} from "../utils/errors/AppError.js";
import {sendProposalApprovedEmail, sendProposalRejectedEmail} from "./email.service.js";
import type {
    CreateProposalRequest,
    UpdateProposalRequest,
    ReviewProposalRequest,
    ProposalQueryRequest
} from "../schemas/proposal.schemas.js";

export async function getAll(query: ProposalQueryRequest) {
    const {page, limit, status} = query;

    const where = {
        ...(status && {status}),
    };

    const [proposals, total] = await Promise.all([
        prisma.proposal.findMany({
            where,
            include: {user: {select: {id: true, username: true, email: true}}},
            orderBy: {createdAt: "desc"},
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.proposal.count({where}),
    ]);

    return {proposals, total, page, limit};
}

export async function getMine(userId: string, query: ProposalQueryRequest) {
    const {page, limit, status} = query;

    const where = {
        userId,
        ...(status && {status}),
    };

    const [proposals, total] = await Promise.all([
        prisma.proposal.findMany({
            where,
            include: {user: {select: {id: true, username: true, email: true}}},
            orderBy: {createdAt: "desc"},
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.proposal.count({where}),
    ]);

    return {proposals, total, page, limit};
}

export async function getById(id: string, userId: string, isAdmin: boolean) {
    const proposal = await prisma.proposal.findUnique({
        where: {id},
        include: {user: {select: {id: true, username: true, email: true}}},
    });

    if (!proposal) {
        throw new ResourceNotFoundError("Proposal not found");
    }

    if (!isAdmin && proposal.userId !== userId) {
        throw new ForbiddenError("Access denied");
    }

    return proposal;
}

export async function create(userId: string, data: CreateProposalRequest) {
    return prisma.proposal.create({
        data: {...data, userId},
    });
}

export async function update(id: string, userId: string, data: UpdateProposalRequest) {
    const proposal = await prisma.proposal.findUnique({where: {id}});
    if (!proposal) {
        throw new ResourceNotFoundError("Proposal not found");
    }

    if (proposal.userId !== userId) {
        throw new ForbiddenError("Access denied");
    }

    if (proposal.status !== ProposalStatus.PENDING) {
        throw new InvalidActionError("Only pending proposals can be edited");
    }

    return prisma.proposal.update({where: {id}, data});
}

export async function remove(id: string, userId: string) {
    const proposal = await prisma.proposal.findUnique({where: {id}});
    if (!proposal) {
        throw new ResourceNotFoundError("Proposal not found");
    }

    if (proposal.userId !== userId) {
        throw new ForbiddenError("Access denied");
    }

    if (proposal.status !== ProposalStatus.PENDING) {
        throw new InvalidActionError("Only pending proposals can be deleted");
    }

    await prisma.proposal.delete({where: {id}});
}

export async function review(id: string, data: ReviewProposalRequest) {
    const proposal = await prisma.proposal.findUnique({
        where: {id},
        include: {user: {select: {username: true, email: true}}},
    });

    if (!proposal) {
        throw new ResourceNotFoundError("Proposal not found");
    }

    if (proposal.status !== ProposalStatus.PENDING) {
        throw new InvalidActionError("Only pending proposals can be reviewed");
    }

    const updated = await prisma.proposal.update({
        where: {id},
        data: {status: data.status, adminNote: data.adminNote ?? null},
    });

    let api = null;
    if (data.status === ProposalStatus.ACCEPTED) {
        api = await prisma.api.create({
            data: {
                name: proposal.name,
                description: proposal.description,
                url: proposal.url,
                categoryId: proposal.categoryId,
                isHttps: proposal.isHttps,
                corsStatus: proposal.corsStatus,
                isFree: proposal.isFree,
                authType: proposal.authType,
            },
            include: {category: {select: {id: true, name: true}}},
        });
    }

    try {
        if (data.status === ProposalStatus.ACCEPTED) {
            await sendProposalApprovedEmail(proposal.user.email, proposal.user.username, proposal.name);
        } else {
            await sendProposalRejectedEmail(proposal.user.email, proposal.user.username, proposal.name, data.adminNote!);
        }
    } catch {
        console.error(`Failed to send proposal review email to ${proposal.user.email}`);
    }

    return {proposal: updated, api};
}
