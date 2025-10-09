// Controller responsável por gerenciar os treinos (workouts)
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * @desc Lista todos os treinos de um aluno
 * @route GET /workouts/:studentId
 */
export const getWorkoutsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const personalId = req.user.id;

    // Verifica se o aluno pertence ao personal logado
    const student = await prisma.student.findFirst({
      where: { id: studentId, personalId },
    });

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
    const student = await prisma.student.findFirst({
      where: { id: studentId, personalId },
    });

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

    res
      .status(201)
      .json({ message: "Treino criado com sucesso", workout });
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
