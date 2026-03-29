import {Router} from "express";
import * as ProposalController from "../controllers/proposal.controller.js";
import {validateSchema as validate, requestSchema} from "../middlewares/validateSchema.js";
import {requireAuthenticated} from "../middlewares/requireAuthenticated.js";
import {requireAdmin} from "../middlewares/requireAdmin.js";
import {createProposalSchema, updateProposalSchema, reviewProposalSchema, proposalQuerySchema} from "../schemas/proposal.schemas.js";
import {uuidParamSchema} from "../schemas/common.schemas.js";

const router = Router();

router.use(requireAuthenticated);

router.get("/", validate(requestSchema({query: proposalQuerySchema})), ProposalController.getAll);
router.get("/:id", validate(requestSchema({params: uuidParamSchema})), ProposalController.getById);
router.post("/", validate(requestSchema({body: createProposalSchema})), ProposalController.create);
router.patch("/:id", validate(requestSchema({params: uuidParamSchema, body: updateProposalSchema})), ProposalController.update);
router.delete("/:id", validate(requestSchema({params: uuidParamSchema})), ProposalController.remove);

router.post("/:id/review", requireAdmin, validate(requestSchema({params: uuidParamSchema, body: reviewProposalSchema})), ProposalController.review);

export default router;
