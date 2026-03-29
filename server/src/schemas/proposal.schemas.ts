import {z} from "zod";
import {apiEntryBaseSchema, ProposalStatus} from "./common.schemas.js";

export const createProposalSchema = apiEntryBaseSchema;
export const updateProposalSchema = apiEntryBaseSchema.partial();
export const reviewProposalSchema = z.object({
    status: ProposalStatus.exclude(["PENDING"], {error: "Proposal review result must be either ACCEPTED or REJECTED"}),
    adminNote: z
        .string()
        .max(500, {error: "Admin note must be at most 500 characters"})
        .trim()
        .optional(),
}).refine(
    (data) => data.status !== "REJECTED" || (data.adminNote && data.adminNote.length > 0),
    {error: "Admin note is required when rejecting a proposal", path: ["adminNote"]},
);

export type CreateProposalRequest = z.infer<typeof createProposalSchema>;
export type UpdateProposalRequest = z.infer<typeof updateProposalSchema>;
export type ReviewProposalRequest = z.infer<typeof reviewProposalSchema>;
