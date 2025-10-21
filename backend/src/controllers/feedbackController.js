import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../utils/notify.js";
const prisma = new PrismaClient();

/**
 * @desc Lista feedbacks de um aluno
 * @route GET /feedbacks/:studentId
 */
export const getFeedbacksByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const personalId = req.user.id;

    let student = null;
    if (req.user.role === "student") {
      student = await prisma.student.findFirst({ where: { id: studentId, userId: req.user.id } });
    } else {
      student = await prisma.student.findFirst({ where: { id: studentId, personalId } });
    }

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

    // Permitir personal dono ou o próprio aluno
    if (req.user.role === "student") {
      const owned = await prisma.student.findFirst({ where: { id: studentId, userId: req.user.id } });
      if (!owned) return res.status(403).json({ error: "Acesso negado" });
    } else {
      const owned = await prisma.student.findFirst({ where: { id: studentId, personalId: req.user.id } });
      if (!owned) return res.status(403).json({ error: "Aluno não pertence a este personal" });
    }

    const feedback = await prisma.feedback.create({
      data: {
        studentId,
        workoutId: workoutId || null,
        rating: rating ? Number(rating) : null,
        comment,
      },
    });

    // Responde imediatamente
    res.status(201).json({ message: "Feedback registrado com sucesso", feedback });

    // Notificações assíncronas: aluno -> personal, personal -> aluno
    setImmediate(async () => {
      try {
        const appUrl = process.env.APP_URL || "http://localhost:3000";
        if (req.user.role === "student") {
          const studentWithPersonal = await prisma.student.findUnique({
            where: { id: studentId },
            include: { personal: true },
          });
          if (studentWithPersonal?.personal?.email) {
            const subject = "Novo feedback do aluno";
            const html = `
              <p>Olá ${studentWithPersonal.personal.name || ""},</p>
              <p>Seu aluno ${studentWithPersonal.name} enviou um novo feedback.</p>
              ${rating ? `<p><strong>Avaliação:</strong> ${Number(rating)}/5</p>` : ""}
              ${comment ? `<p><strong>Comentário:</strong> ${comment}</p>` : ""}
              <p>Veja os detalhes no app:</p>
              <p><a href="${appUrl}" target="_blank" rel="noopener">Abrir o app</a></p>
            `;
            await sendEmail(studentWithPersonal.personal.email, subject, html);
          }
        } else {
          const studentData = await prisma.student.findUnique({ where: { id: studentId } });
          if (studentData?.email) {
            const subject = "Novo feedback do personal";
            const html = `
              <p>Olá ${studentData.name},</p>
              <p>Você recebeu um novo feedback do seu personal.</p>
              ${rating ? `<p><strong>Avaliação:</strong> ${Number(rating)}/5</p>` : ""}
              ${comment ? `<p><strong>Comentário:</strong> ${comment}</p>` : ""}
              <p>Veja os detalhes no app:</p>
              <p><a href="${appUrl}" target="_blank" rel="noopener">Abrir o app</a></p>
            `;
            await sendEmail(studentData.email, subject, html);
          }
        }
      } catch (e) {
        console.error("Falha ao enviar e-mail de feedback:", e);
      }
    });
  } catch (error) {
    console.error("Erro ao criar feedback:", error);
    res.status(500).json({ error: "Erro ao criar feedback" });
  }
};
