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
      include: {
        replies: {
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
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

/**
 * @desc Adiciona um comentário a um feedback existente
 * @route POST /feedbacks/:feedbackId/replies
 */
export const addFeedbackReply = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: "Texto é obrigatório" });

    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: { student: true },
    });
    if (!feedback) return res.status(404).json({ error: "Feedback não encontrado" });

    // só o personal dono ou o aluno dono podem comentar
    if (req.user.role === "student") {
      const isOwner = feedback.student.userId === req.user.id;
      if (!isOwner) return res.status(403).json({ error: "Acesso negado" });
    } else if (req.user.role === "personal") {
      const isOwner = feedback.student.personalId === req.user.id;
      if (!isOwner) return res.status(403).json({ error: "Acesso negado" });
    } // admin permitido

    const reply = await prisma.feedbackReply.create({
      data: { feedbackId, authorId: req.user.id, text: text.trim() },
      include: { author: { select: { id: true, name: true, role: true } } },
    });
    return res.status(201).json({ message: "Comentário adicionado", reply });
  } catch (error) {
    console.error("Erro ao adicionar comentário de feedback:", error);
    return res.status(500).json({ error: "Erro ao adicionar comentário" });
  }
};
