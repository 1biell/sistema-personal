import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Listar usuários (opcionalmente por role)
export const listUsers = async (req, res) => {
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
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
};

// Obter um usuário específico
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
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
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
};

// Criar um usuário personal (somente admin)
export const createPersonal = async (req, res) => {
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
        name,
        email,
        passwordHash,
        role: "personal",
        subscriptionPlan: subscriptionPlan || null,
        subscriptionDueDate: subscriptionDueDate ? new Date(subscriptionDueDate) : null,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    res.status(201).json({ message: "Personal criado", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar personal" });
  }
};

// Atualizar dados do usuário (planos, status, nome, senha opcional)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, subscriptionPlan, subscriptionDueDate, active, password } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (subscriptionPlan !== undefined) data.subscriptionPlan = subscriptionPlan || null;
    if (subscriptionDueDate !== undefined)
      data.subscriptionDueDate = subscriptionDueDate ? new Date(subscriptionDueDate) : null;
    if (active !== undefined) data.active = Boolean(active);
    if (password) data.passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        subscriptionPlan: true,
        subscriptionDueDate: true,
      },
    });

    res.json({ message: "Usuário atualizado", user });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") return res.status(404).json({ error: "Usuário não encontrado" });
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
};

// Excluir usuário (somente admin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    if (user.role === "admin") return res.status(403).json({ error: "Não é permitido excluir o admin" });

    await prisma.user.delete({ where: { id } });
    res.json({ message: "Usuário excluído com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir usuário" });
  }
};


