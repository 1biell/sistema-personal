import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getDashboardStats = async (req, res) => {
  try {
    const personalId = req.user.id;

    // === Métricas gerais ===
    const totalStudents = await prisma.student.count({ where: { personalId } });
    const totalWorkouts = await prisma.workout.count({
      where: { student: { personalId } },
    });
    const totalFeedbacks = await prisma.feedback.count({
      where: { student: { personalId } },
    });

    const avgRating = await prisma.feedback.aggregate({
      where: { student: { personalId } },
      _avg: { rating: true },
    });

    // === Últimos alunos ===
    const latestStudents = await prisma.student.findMany({
      where: { personalId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    // === Crescimento de alunos (últimos 6 meses) ===
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return {
        label: date.toLocaleString("pt-BR", { month: "short" }),
        year: date.getFullYear(),
        start: new Date(date.getFullYear(), date.getMonth(), 1),
        end: new Date(date.getFullYear(), date.getMonth() + 1, 1),
      };
    }).reverse();

    const studentsByMonth = await Promise.all(
      months.map(async (m) => {
        const count = await prisma.student.count({
          where: {
            personalId,
            createdAt: {
              gte: m.start,
              lt: m.end,
            },
          },
        });
        return { label: `${m.label}/${m.year}`, count };
      })
    );

    // === Retorno ===
    res.json({
      totalStudents,
      totalWorkouts,
      totalFeedbacks,
      avgRating: avgRating._avg.rating || 0,
      latestStudents,
      studentsByMonth,
    });
  } catch (error) {
    console.error("Erro no dashboard:", error);
    res
      .status(500)
      .json({ error: "Erro ao carregar métricas do dashboard" });
  }
};
