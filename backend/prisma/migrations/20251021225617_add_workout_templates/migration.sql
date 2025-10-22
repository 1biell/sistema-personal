-- CreateTable
CREATE TABLE "WorkoutTemplate" (
  "id" TEXT PRIMARY KEY,
  "personalId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "dayOfWeek" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WorkoutTemplate_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TemplateExercise" (
  "id" TEXT PRIMARY KEY,
  "templateId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "series" INTEGER,
  "repetitions" TEXT,
  "load" DOUBLE PRECISION,
  "restTime" TEXT,
  "notes" TEXT,
  CONSTRAINT "TemplateExercise_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WorkoutTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes (optional)
CREATE INDEX "WorkoutTemplate_personalId_idx" ON "WorkoutTemplate" ("personalId");
CREATE INDEX "TemplateExercise_templateId_idx" ON "TemplateExercise" ("templateId");
