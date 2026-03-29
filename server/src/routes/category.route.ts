import {Router} from "express";
import * as CategoryController from "../controllers/category.controller.js";
import {validateSchema as validate, requestSchema} from "../middlewares/validateSchema.js";
import {requireAuthenticated} from "../middlewares/requireAuthenticated.js";
import {requireAdmin} from "../middlewares/requireAdmin.js";
import {createCategorySchema, updateCategorySchema} from "../schemas/category.schemas.js";
import {uuidParamSchema} from "../schemas/common.schemas.js";

const router = Router();

router.get("/", CategoryController.getAll);
router.get("/:id", validate(requestSchema({params: uuidParamSchema})), CategoryController.getById);
router.post("/", requireAuthenticated, requireAdmin, validate(requestSchema({body: createCategorySchema})), CategoryController.create);
router.patch("/:id", requireAuthenticated, requireAdmin, validate(requestSchema({
    params: uuidParamSchema,
    body: updateCategorySchema
})), CategoryController.update);
router.delete("/:id", requireAuthenticated, requireAdmin, validate(requestSchema({params: uuidParamSchema})), CategoryController.remove);

export default router;
