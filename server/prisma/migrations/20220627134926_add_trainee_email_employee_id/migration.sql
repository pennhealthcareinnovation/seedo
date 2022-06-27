/*
  Warnings:

  - You are about to drop the column `syncId` on the `observations` table. All the data in the column will be lost.
  - You are about to drop the column `pennId` on the `trainees` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[medhubProcedureId]` on the table `observations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `trainees` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[employeId]` on the table `trainees` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `trainees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeId` to the `trainees` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "observations_syncId_key";

-- DropIndex
DROP INDEX "trainees_pennId_key";

-- AlterTable
ALTER TABLE "observations" DROP COLUMN "syncId",
ADD COLUMN     "medhubLogId" INTEGER,
ADD COLUMN     "medhubPatientId" TEXT,
ADD COLUMN     "medhubProcedureId" INTEGER;

-- AlterTable
ALTER TABLE "trainees"
  ADD COLUMN     "email" VARCHAR(320);
ALTER TABLE "trainees"
  RENAME COLUMN "pennId" to "employeeId";

-- populate emails
UPDATE
	trainees
SET
	email=trainees.data->>'email'
FROM
	trainees as tb2
WHERE
	trainees.id = tb2.id;

ALTER TABLE "trainees"
  ALTER COLUMN email SET NOT NULL;


-- CreateIndex
CREATE UNIQUE INDEX "observations_medhubProcedureId_key" ON "observations"("medhubProcedureId");

-- CreateIndex
CREATE UNIQUE INDEX "trainees_email_key" ON "trainees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "trainees_employeeId_key" ON "trainees"("employeeId");

