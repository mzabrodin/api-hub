import express from "express";
import authRoute from "./auth.route.js";
import categoryRoute from "./category.route.js";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/categories", categoryRoute);

export default router;