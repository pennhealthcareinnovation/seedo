-- AlterTable
ALTER TABLE "observations" ADD COLUMN     "supervisingFacultyId" INTEGER;

-- AddForeignKey
ALTER TABLE "observations" ADD CONSTRAINT "observations_supervisingFacultyId_fkey" FOREIGN KEY ("supervisingFacultyId") REFERENCES "faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;
