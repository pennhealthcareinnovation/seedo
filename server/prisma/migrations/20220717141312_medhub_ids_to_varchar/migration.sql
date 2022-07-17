/*
  Warnings:

  - You are about to alter the column `medhubLogId` on the `observations` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `medhubPatientId` on the `observations` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `medhubProcedureId` on the `observations` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "observations" ALTER COLUMN "medhubLogId" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "medhubPatientId" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "medhubProcedureId" SET DATA TYPE VARCHAR(255);
