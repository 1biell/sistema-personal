import express from "express";
import { verifyToken, requireAdmin } from "../middlewares/authMiddleware.js";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getStudentLimitForPlan } from "../utils/plans.js";
import { deleteUserCascade } from "../utils/deleteCascade.js";

const prisma = new PrismaClient();

async function loadAdminController() {
  try {
    const mod = await import("../controllers/adminController.js");
    return mod?.default ?? mod;
  } catch {
    return {};
  }
}

const router = express.Router();

// Todas as rotas abaixo exigem admin
router.use(verifyToken, requireAdmin);

router.get("/users", async (req, res) => {
  const ctrl = await loadAdminController();
  if (typeof ctrl.listUsers === "function") return ctrl.listUsers(req, res);
  try {
    const { role } = req.query;
    const where = role ? { role } : {};
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        subscriptionPlan: true,
        subscriptionDueDate: true,
        createdAt: true,
      },
    });
    const enriched = users.map((u) => ({
      ...u,
      studentLimit: (v => v === Infinity ? "ilimitado" : v)(getStudentLimitForPlan(u.subscriptionPlan))
    }));
    return res.json({ users: enriched });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao listar usuários" });
  }
});

router.get("/users/:id", async (req, res) => {
  const ctrl = await loadAdminController();
  if (typeof ctrl.getUser === "function") return ctrl.getUser(req, res);
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true, active: true,
        subscriptionPlan: true, subscriptionDueDate: true, createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    const limit = getStudentLimitForPlan(user.subscriptionPlan);
    return res.json({ user: { ...user, studentLimit: limit === Infinity ? "ilimitado" : limit } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

router.post("/users", async (req, res) => {
  const ctrl = await loadAdminController();
  if (typeof ctrl.createPersonal === "function") return ctrl.createPersonal(req, res);
  try {
    const { name, email, password, subscriptionPlan, subscriptionDueDate } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios" });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: "E-mail já cadastrado" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name, email, passwordHash, role: "personal",
        subscriptionPlan: subscriptionPlan || null,
        subscriptionDueDate: subscriptionDueDate ? new Date(subscriptionDueDate) : null,
      },
      select: { id: true, name: true, email: true, role: true },
    });
    return res.status(201).json({ message: "Personal criado", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao criar personal" });
  }
});

router.patch("/users/:id", async (req, res) => {
  const ctrl = await loadAdminController();
  if (typeof ctrl.updateUser === "function") return ctrl.updateUser(req, res);
  try {
    const { id } = req.params;
    const { name, email, subscriptionPlan, subscriptionDueDate, active, password } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (subscriptionPlan !== undefined) data.subscriptionPlan = subscriptionPlan || null;
    if (subscriptionDueDate !== undefined) data.subscriptionDueDate = subscriptionDueDate ? new Date(subscriptionDueDate) : null;
    if (active !== undefined) data.active = Boolean(active);
    if (password) data.passwordHash = await bcrypt.hash(password, 10);
    if (data.subscriptionDueDate && data.subscriptionDueDate <= new Date()) {
      return res.status(400).json({ error: "subscriptionDueDate deve ser uma data futura válida." });
    }
    const user = await prisma.user.update({ where: { id }, data, select: { id: true, name: true, email: true, role: true, active: true, subscriptionPlan: true, subscriptionDueDate: true } });
    return res.json({ message: "Usuário atualizado", user });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") return res.status(404).json({ error: "Usuário não encontrado" });
    return res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

router.patch("/users/:id/plan", async (req, res) => {
  const ctrl = await loadAdminController();
  if (typeof ctrl.updateUserPlan === "function") return ctrl.updateUserPlan(req, res);
  try {
    const { id } = req.params;
    const { subscriptionPlan, subscriptionDueDate } = req.body;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    if (user.role !== "personal") return res.status(400).json({ error: "Somente usuários do tipo personal podem ter plano." });
    const plan = (subscriptionPlan || "").toString().toLowerCase();
    const allowed = ["basico", "avancado", "ilimitado"];
    if (!allowed.includes(plan)) return res.status(400).json({ error: "Plano inválido. Use basico, avancado ou ilimitado." });
    const data = { subscriptionPlan: plan, subscriptionDueDate: subscriptionDueDate ? new Date(subscriptionDueDate) : null };
    if (data.subscriptionDueDate && data.subscriptionDueDate <= new Date()) return res.status(400).json({ error: "subscriptionDueDate deve ser uma data futura válida." });
    const updated = await prisma.user.update({ where: { id }, data, select: { id: true, name: true, email: true, role: true, active: true, subscriptionPlan: true, subscriptionDueDate: true } });
    const limit = getStudentLimitForPlan(updated.subscriptionPlan);
    return res.json({ message: "Plano atualizado", user: updated, subscription: { plan: updated.subscriptionPlan, dueDate: updated.subscriptionDueDate, studentLimit: limit === Infinity ? "ilimitado" : limit } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao atualizar plano" });
  }
});

router.delete("/users/:id", async (req, res) => {
  const ctrl = await loadAdminController();
  if (typeof ctrl.deleteUser === "function") return ctrl.deleteUser(req, res);
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    if (user.role === "admin") return res.status(403).json({ error: "Não é permitido excluir o admin" });
    await deleteUserCascade(id);
    return res.json({ message: "Usuário excluído com sucesso" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao excluir usuário" });
  }
});

export default router;

