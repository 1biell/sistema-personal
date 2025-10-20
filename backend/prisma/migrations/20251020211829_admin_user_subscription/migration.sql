-- AlterTable
ALTER TABLE "User" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "subscriptionDueDate" TIMESTAMP(3),
ADD COLUMN     "subscriptionPlan" TEXT;
