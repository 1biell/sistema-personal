import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import * as userController from "../controllers/userController.js";

const router = express.Router();

// Perfil
router.put("/update-profile", verifyToken, (req, res, next) => userController.updateProfile(req, res, next));

// Senha
router.put("/change-password", verifyToken, (req, res, next) => userController.updatePassword(req, res, next));

// Conta
router.delete("/delete-account", verifyToken, (req, res, next) => userController.deleteAccount(req, res, next));

// Assinatura / Teste grátis
router.post("/start-trial", verifyToken, (req, res, next) => userController.startTrial(req, res, next));
router.get("/subscription", verifyToken, (req, res, next) => userController.getSubscription(req, res, next));
router.get("/plans", verifyToken, (req, res, next) => userController.listPlans(req, res, next));

export default router;
