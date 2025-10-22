import { PrismaClient } from "@prisma/client";

// Optional: accept external prisma, otherwise create one
const prisma = new PrismaClient();

export async function deleteStudentCascade(studentId) {
  // Load related ids to delete in proper order without DB FK cascades
  const workouts = await prisma.workout.findMany({ where: { studentId }, select: { id: true } });
  const workoutIds = workouts.map(w => w.id);

  const diets = await prisma.diet.findMany({ where: { studentId }, select: { id: true } });
  const dietIds = diets.map(d => d.id);

  // Delete child records
  if (workoutIds.length) {
    await prisma.exercise.deleteMany({ where: { workoutId: { in: workoutIds } } });
    await prisma.feedback.deleteMany({ where: { workoutId: { in: workoutIds } } });
  }
  await prisma.feedback.deleteMany({ where: { studentId } });
  if (dietIds.length) {
    await prisma.dietMeal.deleteMany({ where: { dietId: { in: dietIds } } });
  }
  await prisma.diet.deleteMany({ where: { studentId } });
  await prisma.progress.deleteMany({ where: { studentId } });
  await prisma.payment.deleteMany({ where: { studentId } });
  await prisma.workout.deleteMany({ where: { studentId } });

  // Finally delete the student
  await prisma.student.delete({ where: { id: studentId } });
}

export async function deleteUserCascade(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  // Delete password reset tokens for this user
  await prisma.passwordReset.deleteMany({ where: { userId } });

  if (user.role === "personal") {
    const students = await prisma.student.findMany({ where: { personalId: userId }, select: { id: true } });
    for (const s of students) {
      await deleteStudentCascade(s.id);
    }
    // Safety: remove any dangling payments for personal
    await prisma.payment.deleteMany({ where: { personalId: userId } });
  }

  if (user.role === "student") {
    const student = await prisma.student.findFirst({ where: { userId: userId }, select: { id: true } });
    if (student) {
      await deleteStudentCascade(student.id);
    }
  }

  // Finally delete user record
  await prisma.user.delete({ where: { id: userId } });
}

