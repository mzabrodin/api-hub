import {Router} from "express";
import * as UserController from "../controllers/user.controller.js";
import {validateSchema as validate, requestSchema} from "../middlewares/validateSchema.js";
import {requireAuthenticated} from "../middlewares/requireAuthenticated.js";
import {requireAdmin} from "../middlewares/requireAdmin.js";
import {updateProfileSchema} from "../schemas/user.schemas.js";
import {uuidParamSchema} from "../schemas/common.schemas.js";

const router = Router();

router.use(requireAuthenticated);

router.get("/me", UserController.getMe);
router.patch("/me", validate(requestSchema({body: updateProfileSchema})), UserController.updateMe);
router.get("/", requireAdmin, UserController.getAll);
router.get("/:id", requireAdmin, validate(requestSchema({params: uuidParamSchema})), UserController.getById);
router.get("/:id/proposals", requireAdmin, validate(requestSchema({params: uuidParamSchema})), UserController.getProposals);

export default router;
