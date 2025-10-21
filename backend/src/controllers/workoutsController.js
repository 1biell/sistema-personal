// Controller responsável por gerenciar os treinos (workouts)
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../utils/notify.js";
const prisma = new PrismaClient();

/**
 * @desc Lista todos os treinos de um aluno
 * @route GET /workouts/:studentId
 */
export const getWorkoutsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const personalId = req.user.id;

    // Verifica se o aluno pertence ao personal logado ou é o próprio aluno
    let student = null;
    if (req.user.role === "student") {
      student = await prisma.student.findFirst({ where: { id: studentId, userId: req.user.id } });
    } else {
      student = await prisma.student.findFirst({ where: { id: studentId, personalId } });
    }

    if (!student) {
      return res
        .status(404)
        .json({ error: "Aluno não encontrado ou não pertence a este personal" });
    }

    const workouts = await prisma.workout.findMany({
      where: { studentId },
    });

    res.json(workouts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar treinos" });
  }
};

/**
 * @desc Cria um novo treino para um aluno
 * @route POST /workouts/:studentId
 */
export const createWorkout = async (req, res) => {
  try {
    const { studentId } = req.params;
    const personalId = req.user.id;
    const { title, description, dayOfWeek } = req.body;

    // Verifica se o aluno pertence ao personal logado
    const student = await prisma.student.findFirst({ where: { id: studentId, personalId } });

    if (!student) {
      return res
        .status(404)
        .json({ error: "Aluno não encontrado ou não pertence a este personal" });
    }

    const workout = await prisma.workout.create({
      data: {
        studentId,
        title,
        description,
        dayOfWeek,
      },
    });

    // Responde imediatamente ao cliente
    res
      .status(201)
      .json({ message: "Treino criado com sucesso", workout });

    // Dispara e-mail de forma assíncrona (não bloqueia resposta)
    setImmediate(async () => {
      try {
        const appUrl = process.env.APP_URL || "http://localhost:3000";
        const subject = "Novo treino disponível";
        const html = `
          <p>Olá ${student.name},</p>
          <p>Seu personal acabou de cadastrar um novo treino.</p>
          <p><strong>Título:</strong> ${title}</p>
          <p>Você pode acessar o app para ver os detalhes:</p>
          <p><a href="${appUrl}" target="_blank" rel="noopener">Abrir o app</a></p>
        `;
        await sendEmail(student.email, subject, html);
      } catch (e) {
        console.error("Falha ao enviar e-mail de novo treino:", e);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar treino" });
  }
};

/**
 * @desc Atualiza um treino existente
 * @route PUT /workouts/:id
 */
export const updateWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const personalId = req.user.id;
    const { title, description, dayOfWeek } = req.body;

    // Verifica se o treino pertence ao personal logado
    const workout = await prisma.workout.findFirst({
      where: {
        id,
        student: { personalId },
      },
      include: { student: true },
    });

    if (!workout) {
      return res
        .status(404)
        .json({ error: "Treino não encontrado ou não pertence a este personal" });
    }

    const updated = await prisma.workout.update({
      where: { id },
      data: { title, description, dayOfWeek },
    });

    res.json({ message: "Treino atualizado com sucesso", updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar treino" });
  }
};

/**
 * @desc Deleta um treino
 * @route DELETE /workouts/:id
 */
export const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const personalId = req.user.id;

    // Verifica se o treino pertence ao personal logado
    const workout = await prisma.workout.findFirst({
      where: {
        id,
        student: { personalId },
      },
      include: { student: true },
    });

    if (!workout) {
      return res
        .status(404)
        .json({ error: "Treino não encontrado ou não pertence a este personal" });
    }

    await prisma.workout.delete({ where: { id } });

    res.json({ message: "Treino excluído com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao excluir treino" });
  }
};
