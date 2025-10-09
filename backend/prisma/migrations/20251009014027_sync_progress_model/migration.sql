/*
  Warnings:

  - You are about to drop the column `arms` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `legs` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `photoUrl` on the `Progress` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Progress" DROP COLUMN "arms",
DROP COLUMN "legs",
DROP COLUMN "photoUrl",
ADD COLUMN     "arm" DOUBLE PRECISION,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "leg" DOUBLE PRECISION,
ADD COLUMN     "observation" TEXT;
