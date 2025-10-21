// Controller responsável por gerenciar o progresso físico dos alunos
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * @desc Lista todos os registros de progresso de um aluno
 * @route GET /progress/:studentId
 */
export const getProgressByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const personalId = req.user.id;

    // Permite leitura ao personal dono ou ao próprio aluno
    let student = null;
    if (req.user.role === "student") {
      student = await prisma.student.findFirst({ where: { id: studentId, userId: req.user.id } });
    } else {
      student = await prisma.student.findFirst({ where: { id: studentId, personalId } });
    }

    if (!student) {
      return res.status(404).json({
        error: "Aluno não encontrado ou não pertence a este personal",
      });
    }

    const progressList = await prisma.progress.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
    });

    res.json(progressList);
  } catch (error) {
    console.error("Erro ao listar progresso:", error);
    res.status(500).json({ error: "Erro ao listar progresso" });
  }
};

/**
 * @desc Cria um novo registro de progresso
 * @route POST /progress/:studentId
 */
export const createProgress = async (req, res) => {
  try {
    const { studentId } = req.params;
    const personalId = req.user.id;
    const { weight, chest, waist, arm, leg, observation } = req.body;

    // Criação: por padrão somente personal dono
    const student = await prisma.student.findFirst({ where: { id: studentId, personalId } });

    if (!student) {
      return res.status(404).json({
        error: "Aluno não encontrado ou não pertence a este personal",
      });
    }

    const progress = await prisma.progress.create({
      data: {
        studentId,
        weight: weight ? Number(weight) : null,
        chest: chest ? Number(chest) : null,
        waist: waist ? Number(waist) : null,
        arm: arm ? Number(arm) : null,
        leg: leg ? Number(leg) : null,
        observation,
      },
    });

    res.status(201).json({ message: "Progresso registrado com sucesso", progress });
  } catch (error) {
    console.error("Erro ao criar progresso:", error);
    res.status(500).json({ error: "Erro ao criar progresso" });
  }
};
