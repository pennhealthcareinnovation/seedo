-- CreateTable
CREATE TABLE "programs" (
    "id" SERIAL NOT NULL,
    "programID" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainees" (
    "id" SERIAL NOT NULL,
    "medhubUserId" VARCHAR(255) NOT NULL,
    "medhubProgramId" VARCHAR(255) NOT NULL,
    "pennId" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255),
    "firstName" VARCHAR(255),
    "data" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "trainees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "programs_programid_unique" ON "programs"("programID");

-- CreateIndex
CREATE UNIQUE INDEX "trainees_medhubuserid_unique" ON "trainees"("medhubUserId");

-- CreateIndex
CREATE UNIQUE INDEX "trainees_pennid_unique" ON "trainees"("pennId");

-- AddForeignKey
ALTER TABLE "trainees" ADD CONSTRAINT "trainees_medhubprogramid_foreign" FOREIGN KEY ("medhubProgramId") REFERENCES "programs"("programID") ON DELETE NO ACTION ON UPDATE NO ACTION;
