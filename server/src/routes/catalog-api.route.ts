import {Router} from "express";
import * as ApiController from "../controllers/api.controller.js";
import {validateSchema as validate, requestSchema} from "../middlewares/validateSchema.js";
import {requireAuthenticated} from "../middlewares/requireAuthenticated.js";
import {requireAdmin} from "../middlewares/requireAdmin.js";
import {createApiSchema, updateApiSchema, toggleApiSchema, apiQuerySchema} from "../schemas/api.schemas.js";
import {uuidParamSchema} from "../schemas/common.schemas.js";

const router = Router();

router.get("/", validate(requestSchema({query: apiQuerySchema})), ApiController.getAll);
router.get("/:id", validate(requestSchema({params: uuidParamSchema})), ApiController.getById);

router.post("/", requireAuthenticated, requireAdmin, validate(requestSchema({body: createApiSchema})), ApiController.create);
router.patch("/:id", requireAuthenticated, requireAdmin, validate(requestSchema({
    params: uuidParamSchema,
    body: updateApiSchema
})), ApiController.update);
router.patch("/:id/toggle", requireAuthenticated, requireAdmin, validate(requestSchema({
    params: uuidParamSchema,
    body: toggleApiSchema
})), ApiController.toggle);
router.delete("/:id", requireAuthenticated, requireAdmin, validate(requestSchema({params: uuidParamSchema})), ApiController.remove);

export default router;
