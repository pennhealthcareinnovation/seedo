/*
  Warnings:

  - You are about to drop the column `programID` on the `programs` table. All the data in the column will be lost.
  - You are about to drop the column `medhubProgramId` on the `trainees` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[medhubProgramId]` on the table `programs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `medhubProgramId` to the `programs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programId` to the `trainees` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "trainees" DROP CONSTRAINT "trainees_medhubprogramid_foreign";

-- DropIndex
DROP INDEX "programs_programid_unique";

-- AlterTable
ALTER TABLE "programs" DROP COLUMN "programID",
ADD COLUMN     "medhubProgramId" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "trainees" DROP COLUMN "medhubProgramId",
ADD COLUMN     "programId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "procedureTypes" (
    "id" SERIAL NOT NULL,
    "programId" INTEGER NOT NULL,
    "medhubProcedureTypeId" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "procedureTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traineesEhrMetadata" (
    "id" SERIAL NOT NULL,
    "traineeId" INTEGER NOT NULL,
    "data" JSONB,

    CONSTRAINT "traineesEhrMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "observations" (
    "id" SERIAL NOT NULL,
    "traineeId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    "ehrObservationId" VARCHAR(18) NOT NULL,
    "ehrObservationIdType" VARCHAR(18) NOT NULL,
    "observationDate" TIMESTAMPTZ(6) NOT NULL,
    "patientId" VARCHAR(18) NOT NULL,
    "patientIdType" VARCHAR(18) NOT NULL,
    "patientName" VARCHAR(255) NOT NULL,
    "patientBirthDate" TIMESTAMP(3) NOT NULL,
    "data" JSONB,
    "syncId" VARCHAR(255),
    "syncedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "programId" INTEGER NOT NULL,
    "procedureTypeId" INTEGER NOT NULL,
    "observableType" VARCHAR(255) NOT NULL,
    "args" JSONB,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sentEmails" (
    "id" SERIAL NOT NULL,
    "initiatorType" TEXT,
    "initiatorId" INTEGER,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "email" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sentEmails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "procedureTypes_medhubProcedureTypeId_key" ON "procedureTypes"("medhubProcedureTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "traineesEhrMetadata_traineeId_key" ON "traineesEhrMetadata"("traineeId");

-- CreateIndex
CREATE UNIQUE INDEX "observations_syncId_key" ON "observations"("syncId");

-- CreateIndex
CREATE UNIQUE INDEX "observations_traineeId_ehrObservationId_ehrObservationIdTyp_key" ON "observations"("traineeId", "ehrObservationId", "ehrObservationIdType");

-- CreateIndex
CREATE UNIQUE INDEX "programs_medhubProgramId_key" ON "programs"("medhubProgramId");

-- AddForeignKey
ALTER TABLE "procedureTypes" ADD CONSTRAINT "procedureTypes_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainees" ADD CONSTRAINT "trainees_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traineesEhrMetadata" ADD CONSTRAINT "traineesEhrMetadata_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "trainees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observations" ADD CONSTRAINT "observations_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "trainees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observations" ADD CONSTRAINT "observations_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_procedureTypeId_fkey" FOREIGN KEY ("procedureTypeId") REFERENCES "procedureTypes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "trainees_medhubuserid_unique" RENAME TO "trainees_medhubUserId_key";

-- RenameIndex
ALTER INDEX "trainees_pennid_unique" RENAME TO "trainees_pennId_key";
