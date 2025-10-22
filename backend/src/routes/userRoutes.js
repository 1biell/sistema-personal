import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import * as userController from "../controllers/userController.js";
import { PrismaClient } from "@prisma/client";
import { getStudentLimitForPlan } from "../utils/plans.js";

const prisma = new PrismaClient();

async function loadUserController() {
  try {
    const mod = await import("../controllers/userController.js");
    return mod?.default ?? mod;
  } catch {
    return {};
  }
}

const router = express.Router();

// Perfil
router.put("/update-profile", verifyToken, (req, res, next) => userController.updateProfile(req, res, next));

// Senha
router.put("/change-password", verifyToken, (req, res, next) => userController.updatePassword(req, res, next));

// Conta
router.delete("/delete-account", verifyToken, (req, res, next) => userController.deleteAccount(req, res, next));

// Assinatura / Teste grátis
router.post("/start-trial", verifyToken, (req, res, next) => userController.startTrial(req, res, next));
router.get("/subscription", verifyToken, async (req, res, next) => {
  const ctrl = await loadUserController();
  if (typeof ctrl.getSubscription === "function") {
    return ctrl.getSubscription(req, res, next);
  }
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    const plan = user.subscriptionPlan || null;
    const due = user.subscriptionDueDate || null;
    const now = new Date();
    const active = !!(plan && due && new Date(due) > now);
    const remainingDays = active ? Math.ceil((new Date(due) - now) / (24 * 60 * 60 * 1000)) : 0;
    const limit = getStudentLimitForPlan(plan);
    const studentLimit = limit === Infinity ? "ilimitado" : limit;
    return res.json({ plan, dueDate: due, active, remainingDays, studentLimit });
  } catch (err) {
    console.error("Erro fallback subscription:", err);
    return res.status(500).json({ error: "Erro ao obter assinatura" });
  }
});
router.get("/plans", verifyToken, (req, res, next) => userController.listPlans(req, res, next));

export default router;
