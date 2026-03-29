import type {Request, Response} from "express";
import {catchAsync} from "../utils/errors/catchAsync.js";
import * as ProposalService from "../services/proposal.service.js";
import {sendCreated, sendNoContent, sendSuccess, sendPaginated, buildPagination} from "../utils/response.js";
import {UserRole} from "../prisma/generated/enums.js";
import type IdParam from "../types/idParam.js";
import type {
    CreateProposalRequest,
    UpdateProposalRequest,
    ReviewProposalRequest,
    ProposalQueryRequest
} from "../schemas/proposal.schemas.js";

export const getAll = catchAsync(async (req: Request<{}, {}, {}, ProposalQueryRequest>, res: Response) => {
    const isAdmin = req.user!.role === UserRole.ADMIN;

    const {proposals, total, page, limit} = isAdmin
        ? await ProposalService.getAll(req.query)
        : await ProposalService.getMine(req.user!.id, req.query);

    sendPaginated(res, proposals, buildPagination(page, limit, total));
});

export const getById = catchAsync(async (req: Request<IdParam>, res: Response) => {
    const isAdmin = req.user!.role === UserRole.ADMIN;
    const proposal = await ProposalService.getById(req.params.id, req.user!.id, isAdmin);
    sendSuccess(res, {proposal});
});

export const create = catchAsync(async (req: Request<{}, {}, CreateProposalRequest>, res: Response) => {
    const proposal = await ProposalService.create(req.user!.id, req.body);
    sendCreated(res, {proposal});
});

export const update = catchAsync(async (req: Request<IdParam, {}, UpdateProposalRequest>, res: Response) => {
    const proposal = await ProposalService.update(req.params.id, req.user!.id, req.body);
    sendSuccess(res, {proposal});
});

export const remove = catchAsync(async (req: Request<IdParam>, res: Response) => {
    await ProposalService.remove(req.params.id, req.user!.id);
    sendNoContent(res);
});

export const review = catchAsync(async (req: Request<IdParam, {}, ReviewProposalRequest>, res: Response) => {
    const proposal = await ProposalService.review(req.params.id, req.body);
    sendSuccess(res, {proposal});
});
