import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * @desc Lista feedbacks de um aluno
 * @route GET /feedbacks/:studentId
 */
export const getFeedbacksByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const personalId = req.user.id;

    const student = await prisma.student.findFirst({
      where: { id: studentId, personalId },
    });

    if (!student) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
    });

    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Erro ao listar feedbacks:", error);
    res.status(500).json({ error: "Erro ao listar feedbacks" });
  }
};

/**
 * @desc Cria um novo feedback para o aluno
 * @route POST /feedbacks/:studentId
 */
export const createFeedback = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { workoutId, rating, comment } = req.body;

    const feedback = await prisma.feedback.create({
      data: {
        studentId,
        workoutId: workoutId || null,
        rating: rating ? Number(rating) : null,
        comment,
      },
    });

    res.status(201).json({ message: "Feedback registrado com sucesso", feedback });
  } catch (error) {
    console.error("Erro ao criar feedback:", error);
    res.status(500).json({ error: "Erro ao criar feedback" });
  }
};
