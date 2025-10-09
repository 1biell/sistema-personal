// Controller responsável por gerenciar os exercícios de cada treino
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * @desc Lista todos os exercícios de um treino
 * @route GET /exercises/:workoutId
 */
export const getExercisesByWorkout = async (req, res) => {
  try {
    const { workoutId } = req.params;
    const personalId = req.user.id;

    // Garante que o treino pertence ao personal logado
    const workout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        student: {
          personalId: personalId, // Verificação direta do personal
        },
      },
    });

    if (!workout) {
      return res
        .status(404)
        .json({ error: "Treino não encontrado ou não pertence a este personal" });
    }

    const exercises = await prisma.exercise.findMany({
      where: { workoutId },
      orderBy: { name: "asc" },
    });

    res.json(exercises);
  } catch (error) {
    console.error("Erro ao listar exercícios:", error);
    res.status(500).json({ error: "Erro ao listar exercícios" });
  }
};

/**
 * @desc Cria um novo exercício dentro de um treino
 * @route POST /exercises/:workoutId
 */
export const createExercise = async (req, res) => {
  try {
    const { workoutId } = req.params;
    const personalId = req.user.id;
    const { name, series, repetitions, load, restTime, notes } = req.body;

    // Verifica se o treino pertence ao personal logado
    const workout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        student: {
          personalId: personalId,
        },
      },
    });

    if (!workout) {
      return res
        .status(404)
        .json({ error: "Treino não encontrado ou não pertence a este personal" });
    }

    const exercise = await prisma.exercise.create({
      data: {
        workoutId,
        name,
        series: series ? Number(series) : null,
        repetitions,
        load: load ? Number(load) : null,
        restTime,
        notes,
      },
    });

    res.status(201).json({ message: "Exercício criado com sucesso", exercise });
  } catch (error) {
    console.error("Erro ao criar exercício:", error);
    res.status(500).json({ error: "Erro ao criar exercício" });
  }
};

/**
 * @desc Atualiza um exercício
 * @route PUT /exercises/:id
 */
export const updateExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const personalId = req.user.id;
    const { name, series, repetitions, load, restTime, notes } = req.body;

    // Verifica se o exercício pertence ao personal logado
    const exercise = await prisma.exercise.findFirst({
      where: {
        id,
        workout: {
          student: {
            personalId: personalId,
          },
        },
      },
    });

    if (!exercise) {
      return res
        .status(404)
        .json({ error: "Exercício não encontrado ou não pertence a este personal" });
    }

    const updatedExercise = await prisma.exercise.update({
      where: { id },
      data: { name, series, repetitions, load, restTime, notes },
    });

    res.json({ message: "Exercício atualizado com sucesso", updatedExercise });
  } catch (error) {
    console.error("Erro ao atualizar exercício:", error);
    res.status(500).json({ error: "Erro ao atualizar exercício" });
  }
};

/**
 * @desc Remove um exercício
 * @route DELETE /exercises/:id
 */
export const deleteExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const personalId = req.user.id;

    // Verifica se o exercício pertence ao personal logado
    const exercise = await prisma.exercise.findFirst({
      where: {
        id,
        workout: {
          student: {
            personalId: personalId,
          },
        },
      },
    });

    if (!exercise) {
      return res
        .status(404)
        .json({ error: "Exercício não encontrado ou não pertence a este personal" });
    }

    await prisma.exercise.delete({ where: { id } });
    res.json({ message: "Exercício removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover exercício:", error);
    res.status(500).json({ error: "Erro ao remover exercício" });
  }
};
