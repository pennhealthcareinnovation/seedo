-- CreateTable
CREATE TABLE "faculty" (
    "id" SERIAL NOT NULL,
    "programId" INTEGER NOT NULL,
    "medhubUserId" VARCHAR(255) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "employeeId" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255),
    "firstName" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "faculty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "faculty_medhubUserId_key" ON "faculty"("medhubUserId");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_email_key" ON "faculty"("email");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_employeeId_key" ON "faculty"("employeeId");

-- AddForeignKey
ALTER TABLE "faculty" ADD CONSTRAINT "faculty_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
