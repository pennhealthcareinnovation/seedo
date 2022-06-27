/*
  Warnings:

  - You are about to drop the `traineesEhrMetadata` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "traineesEhrMetadata" DROP CONSTRAINT "traineesEhrMetadata_traineeId_fkey";

-- DropTable
DROP TABLE "traineesEhrMetadata";
