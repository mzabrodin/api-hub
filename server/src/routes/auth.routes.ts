import {Router} from "express";
import * as AuthController from "../controllers/auth.controller.js";
import {validateSchema as validate, requestSchema} from "../middlewares/validateSchema.js";
import {requireAuthenticated as authenticateJWT} from "../middlewares/requireAuthenticated.js";
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    verifyEmailSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from "../schemas/auth.schemas.js";
import {changePasswordSchema} from "../schemas/user.schemas.js";

const router = Router();

router.post("/register", validate(requestSchema({body: registerSchema})), AuthController.register);
router.post("/verify-email", validate(requestSchema({body: verifyEmailSchema})), AuthController.verifyEmail);
router.post("/login", validate(requestSchema({body: loginSchema})), AuthController.login);
router.post("/logout", authenticateJWT, AuthController.logout);
router.post("/refresh", validate(requestSchema({body: refreshTokenSchema})), AuthController.refresh);
router.post("/forgot-password", validate(requestSchema({body: forgotPasswordSchema})), AuthController.forgotPassword);
router.post("/reset-password", validate(requestSchema({body: resetPasswordSchema})), AuthController.resetPassword);
router.post("/change-password", authenticateJWT, validate(requestSchema({body: changePasswordSchema})), AuthController.changePassword);

export default router;