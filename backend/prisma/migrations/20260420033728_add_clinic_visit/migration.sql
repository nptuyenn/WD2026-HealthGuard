-- AlterTable
ALTER TABLE "ExamResult" ADD COLUMN     "diagnosis" TEXT,
ADD COLUMN     "labResults" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "prescription" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "ClinicVisit" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "doctorName" TEXT,
    "clinicName" TEXT,
    "diagnosis" TEXT,
    "metrics" JSONB NOT NULL DEFAULT '[]',
    "labResults" JSONB NOT NULL DEFAULT '[]',
    "prescription" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClinicVisit_profileId_idx" ON "ClinicVisit"("profileId");

-- CreateIndex
CREATE INDEX "ClinicVisit_visitDate_idx" ON "ClinicVisit"("visitDate");

-- AddForeignKey
ALTER TABLE "ClinicVisit" ADD CONSTRAINT "ClinicVisit_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "HealthProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
