import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function ensureTemplatesClient() {
  const ok = prisma && prisma.workoutTemplate && prisma.templateExercise;
  if (!ok) {
    const err = new Error("PRISMA_CLIENT_OUTDATED");
    // @ts-ignore
    err.code = "PRISMA_CLIENT_OUTDATED";
    throw err;
  }
}

// List templates for logged personal
export const listTemplates = async (req, res) => {
  try {
    ensureTemplatesClient();
    const personalId = req.user.id;
    const templates = await prisma.workoutTemplate.findMany({
      where: { personalId },
      orderBy: { createdAt: "desc" },
      include: { exercises: true },
    });
    res.json({ templates });
  } catch (err) {
    console.error(err);
    if (err?.code === "PRISMA_CLIENT_OUTDATED") {
      return res.status(500).json({
        error: "Cliente Prisma desatualizado para modelos. Rode: npx prisma generate && npx prisma migrate deploy",
      });
    }
    res.status(500).json({ error: "Erro ao listar modelos" });
  }
};

// Create template with optional exercises[]
export const createTemplate = async (req, res) => {
  try {
    ensureTemplatesClient();
    const personalId = req.user.id;
    const { title, description, dayOfWeek, exercises } = req.body;
    if (!title) return res.status(400).json({ error: "Título é obrigatório" });

    const template = await prisma.workoutTemplate.create({
      data: {
        personalId,
        title,
        description: description || null,
        dayOfWeek: dayOfWeek || null,
        exercises: exercises && Array.isArray(exercises)
          ? {
              create: exercises.map((e) => ({
                name: e.name,
                series: e.series ?? null,
                repetitions: e.repetitions ?? null,
                load: e.load ?? null,
                restTime: e.restTime ?? null,
                notes: e.notes ?? null,
              })),
            }
          : undefined,
      },
      include: { exercises: true },
    });
    res.status(201).json({ message: "Modelo criado", template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar modelo" });
  }
};

export const getTemplate = async (req, res) => {
  try {
    ensureTemplatesClient();
    const personalId = req.user.id;
    const { id } = req.params;
    const template = await prisma.workoutTemplate.findFirst({
      where: { id, personalId },
      include: { exercises: true },
    });
    if (!template) return res.status(404).json({ error: "Modelo não encontrado" });
    res.json({ template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar modelo" });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    ensureTemplatesClient();
    const personalId = req.user.id;
    const { id } = req.params;
    const { title, description, dayOfWeek, exercises } = req.body;

    const exists = await prisma.workoutTemplate.findFirst({ where: { id, personalId } });
    if (!exists) return res.status(404).json({ error: "Modelo não encontrado" });

    // Update main fields
    const updated = await prisma.workoutTemplate.update({
      where: { id },
      data: {
        title: title ?? exists.title,
        description: description ?? exists.description,
        dayOfWeek: dayOfWeek ?? exists.dayOfWeek,
      },
      include: { exercises: true },
    });

    // If exercises provided, replace all
    if (Array.isArray(exercises)) {
      await prisma.templateExercise.deleteMany({ where: { templateId: id } });
      await prisma.templateExercise.createMany({
        data: exercises.map((e) => ({
          templateId: id,
          name: e.name,
          series: e.series ?? null,
          repetitions: e.repetitions ?? null,
          load: e.load ?? null,
          restTime: e.restTime ?? null,
          notes: e.notes ?? null,
        })),
      });
    }

    const finalTemplate = await prisma.workoutTemplate.findUnique({
      where: { id },
      include: { exercises: true },
    });
    res.json({ message: "Modelo atualizado", template: finalTemplate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar modelo" });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    ensureTemplatesClient();
    const personalId = req.user.id;
    const { id } = req.params;
    const exists = await prisma.workoutTemplate.findFirst({ where: { id, personalId } });
    if (!exists) return res.status(404).json({ error: "Modelo não encontrado" });
    await prisma.workoutTemplate.delete({ where: { id } });
    res.json({ message: "Modelo excluído com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir modelo" });
  }
};

// Apply template to a student (clone as Workout + Exercises)
export const applyTemplateToStudent = async (req, res) => {
  try {
    ensureTemplatesClient();
    const personalId = req.user.id;
    const { id } = req.params; // template id
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ error: "studentId é obrigatório" });

    const template = await prisma.workoutTemplate.findFirst({
      where: { id, personalId },
      include: { exercises: true },
    });
    if (!template) return res.status(404).json({ error: "Modelo não encontrado" });

    // verify student belongs to personal
    const student = await prisma.student.findFirst({ where: { id: studentId, personalId } });
    if (!student) return res.status(404).json({ error: "Aluno não encontrado" });

    const workout = await prisma.workout.create({
      data: {
        studentId,
        title: template.title,
        description: template.description,
        dayOfWeek: template.dayOfWeek,
        exercises: {
          create: template.exercises.map((e) => ({
            name: e.name,
            series: e.series,
            repetitions: e.repetitions,
            load: e.load,
            restTime: e.restTime,
            notes: e.notes,
          })),
        },
      },
      include: { exercises: true },
    });
    res.status(201).json({ message: "Modelo aplicado ao aluno", workout });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao aplicar modelo" });
  }
};
