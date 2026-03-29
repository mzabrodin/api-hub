import {Router} from "express";
import * as CategoryController from "../controllers/category.controller.js";
import {validateSchema as validate, requestSchema} from "../middlewares/validateSchema.js";
import {requireAuthenticated} from "../middlewares/requireAuthenticated.js";
import {requireAdmin} from "../middlewares/requireAdmin.js";
import {createCategorySchema, updateCategorySchema} from "../schemas/category.schemas.js";
import {uuidParamSchema} from "../schemas/common.schemas.js";

const router = Router();

router.use(requireAuthenticated);

router.get("/", CategoryController.getAll);
router.get("/:id", validate(requestSchema({params: uuidParamSchema})), CategoryController.getById);
router.post("/", requireAdmin, validate(requestSchema({body: createCategorySchema})), CategoryController.create);
router.patch("/:id", requireAdmin, validate(requestSchema({params: uuidParamSchema, body: updateCategorySchema})), CategoryController.update);
router.delete("/:id", requireAdmin, validate(requestSchema({params: uuidParamSchema})), CategoryController.remove);

export default router;
