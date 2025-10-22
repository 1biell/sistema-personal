import express from "express";
import { publicRegister, loginWithSubscriptionCheck, forgotPassword, resetPassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", publicRegister);
router.post("/login", loginWithSubscriptionCheck);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
