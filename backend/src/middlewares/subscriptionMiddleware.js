import { PrismaClient } from "@prisma/client";
import { getStudentLimitForPlan, isUnlimitedPlan, hasCapability } from "../utils/plans.js";

const prisma = new PrismaClient();

// Verifica se o personal possui assinatura/teste ativo para acessar funcionalidades gerais
export const requireActiveSubscription = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Não autenticado" });

    // Admin e estudante não são bloqueados por assinatura do personal
    if (user.role === "admin" || user.role === "student") return next();

    // Apenas personal precisa de assinatura ativa
    if (user.role === "personal") {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      const plan = dbUser?.subscriptionPlan || null;
      const due = dbUser?.subscriptionDueDate ? new Date(dbUser.subscriptionDueDate) : null;
      if (!plan || !due || due <= new Date()) {
        return res.status(403).json({ error: "Assinatura/Trial expirado", code: "TRIAL_EXPIRED" });
      }
    }
    return next();
  } catch (err) {
    console.error("Erro em requireActiveSubscription:", err);
    return res.status(500).json({ error: "Erro na verificação de assinatura" });
  }
};

// Verifica se o personal pode criar mais alunos conforme plano/teste
export const ensureCanCreateStudent = async (req, res, next) => {
  try {
    const personalId = req.user?.id;
    if (!personalId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const personal = await prisma.user.findUnique({ where: { id: personalId } });
    if (!personal) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }
    if (personal.role !== "personal") {
      return res.status(403).json({ error: "Apenas personal pode gerenciar alunos" });
    }

    const planCode = personal.subscriptionPlan?.toLowerCase() || null;
    const due = personal.subscriptionDueDate ? new Date(personal.subscriptionDueDate) : null;

    if (!planCode) {
      return res.status(403).json({ error: "Você precisa iniciar o teste grátis ou ter um plano ativo." });
    }
    if (due && due < new Date()) {
      return res.status(403).json({ error: "Sua assinatura/teste expirou." });
    }

    if (isUnlimitedPlan(planCode)) {
      return next();
    }

    const current = await prisma.student.count({ where: { personalId } });
    const limit = getStudentLimitForPlan(planCode);
    if (limit === 0) {
      return res.status(403).json({ error: "Plano inválido. Contate o suporte." });
    }
    if (current >= limit) {
      return res.status(403).json({ error: `Limite de alunos do seu plano atingido (${limit}).` });
    }

    return next();
  } catch (err) {
    console.error("Erro na verificação de assinatura:", err);
    return res.status(500).json({ error: "Erro na verificação de assinatura" });
  }
};

// Exige uma capability específica do plano (ex.: 'dashboard')
export const requirePlanCapability = (capability) => {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Não autenticado" });
      if (req.user.role === "admin") return next(); // admin tem acesso
      if (req.user.role !== "personal") return res.status(403).json({ error: "Apenas personal" });

      const dbUser = await prisma.user.findUnique({ where: { id: req.user.id } });
      const plan = dbUser?.subscriptionPlan || null;
      const due = dbUser?.subscriptionDueDate ? new Date(dbUser.subscriptionDueDate) : null;
      if (!plan || !due || due <= new Date()) {
        return res.status(403).json({ error: "Assinatura/Trial expirado", code: "TRIAL_EXPIRED" });
      }
      if (!hasCapability(plan, capability)) {
        return res.status(403).json({ error: "Recurso não disponível no seu plano", code: "CAPABILITY_DENIED", capability });
      }
      return next();
    } catch (err) {
      console.error("Erro em requirePlanCapability:", err);
      return res.status(500).json({ error: "Erro na verificação de capacidade" });
    }
  };
};
