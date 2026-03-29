import express from "express";
import authRoute from "./auth.route.js";
import categoryRoute from "./category.route.js";
import apiRoute from "./catalog-api.route.js";
import proposalRoute from "./proposal.route.js";
import userRoute from "./user.route.js";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/categories", categoryRoute);
router.use("/catalog-api", apiRoute);
router.use("/proposals", proposalRoute);
router.use("/users", userRoute);

export default router;