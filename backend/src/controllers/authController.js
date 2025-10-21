import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { sendPasswordResetEmail } from "../utils/mailer.js";

dotenv.config();
const prisma = new PrismaClient();

// Criar usuário (admin ou personal)
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Preencha todos os campos" });
    }

    // Desabilita registro público após o primeiro usuário existir.
    // Use rotas de admin para criar novos usuários.
    const totalUsers = await prisma.user.count();
    if (totalUsers > 0) {
      return res
        .status(403)
        .json({ error: "Registro público desabilitado. Use a área do admin." });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role,
      },
    });

    res.status(201).json({ message: "Usuário criado com sucesso", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
};

// Login de usuário
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    let studentId = null;
    if (user.role === "student") {
      const student = await prisma.student.findFirst({ where: { userId: user.id } });
      studentId = student?.id || null;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, ...(studentId ? { studentId } : {}) },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login realizado com sucesso",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, studentId },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no login" });
  }
};

// Solicitar redefinição de senha
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: "Informe o e-mail" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "E-mail não encontrado" });
    }

    // invalidar tokens antigos do usuário
    await prisma.passwordReset.updateMany({
      where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
      data: { used: true },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt },
    });

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail(user.email, resetLink);

    res.json({ message: "Se o e-mail existir, enviaremos o link de redefinição." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao solicitar redefinição" });
  }
};

// Redefinir senha usando token
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ error: "Token e nova senha são obrigatórios" });

    const reset = await prisma.passwordReset.findUnique({ where: { token } });
    if (!reset || reset.used || reset.expiresAt < new Date()) {
      return res.status(400).json({ error: "Token inválido ou expirado" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: reset.userId }, data: { passwordHash: hashed } });
    await prisma.passwordReset.update({ where: { token }, data: { used: true } });

    res.json({ message: "Senha redefinida com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao redefinir senha" });
  }
};
