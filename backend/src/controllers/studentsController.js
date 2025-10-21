// Controller responsável por gerenciar os alunos (students)
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

/**
 * @desc Lista todos os alunos do personal logado
 * @route GET /students
 */
export const getStudents = async (req, res) => {
  try {
    const personalId = req.user.id; // ID do personal que veio do token

    const students = await prisma.student.findMany({
      where: { personalId },
    });

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar alunos" });
  }
};

/**
 * @desc Cadastra um novo aluno vinculado ao personal logado
 * @route POST /students
 */
export const createStudent = async (req, res) => {
  try {
    const personalId = req.user.id; // ID do personal autenticado
    const { name, email, phone, age, weight, height, goal, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Nome e email são obrigatórios" });
    }

    const existingStudent = await prisma.student.findUnique({
      where: { email },
    });

    if (existingStudent) {
      return res.status(400).json({ error: "Aluno com esse email já existe" });
    }

    // Criar usuário do aluno para login
    if (!password) {
      return res.status(400).json({ error: "Senha do aluno é obrigatória" });
    }
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: "Já existe um usuário com este e-mail" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: "student" },
    });

    const student = await prisma.student.create({
      data: {
        personalId,
        name,
        email,
        userId: user.id,
        phone,
        age: Number(age) || null,
        weight: Number(weight) || null,
        height: Number(height) || null,
        goal,
      },
    });

    res.status(201).json({ message: "Aluno cadastrado com sucesso", student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar aluno" });
  }
};

/**
 * @desc Atualiza informações de um aluno
 * @route PUT /students/:id
 */
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const personalId = req.user.id;
    const { name, phone, age, weight, height, goal } = req.body;

    // Verifica se o aluno pertence ao personal
    const student = await prisma.student.findFirst({
      where: { id, personalId },
    });

    if (!student) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: { name, phone, age, weight, height, goal },
    });

    res.json({ message: "Aluno atualizado com sucesso", updatedStudent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar aluno" });
  }
};

/**
 * @desc Remove um aluno
 * @route DELETE /students/:id
 */
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const personalId = req.user.id;

    const student = await prisma.student.findFirst({
      where: { id, personalId },
    });

    if (!student) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    await prisma.student.delete({ where: { id } });
    res.json({ message: "Aluno excluído com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao excluir aluno" });
  }
};

/**
 * @desc Busca os detalhes de um aluno específico vinculado ao personal logado
 * @route GET /students/:id
 */
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const personalId = req.user.id; // ID do personal autenticado

    let student = null;
    if (req.user.role === "student") {
      student = await prisma.student.findFirst({ where: { id, userId: req.user.id } });
    } else {
      student = await prisma.student.findFirst({ where: { id, personalId } });
    }

    if (!student) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("Erro ao buscar aluno:", error);
    res.status(500).json({ error: "Erro ao buscar aluno" });
  }
};

