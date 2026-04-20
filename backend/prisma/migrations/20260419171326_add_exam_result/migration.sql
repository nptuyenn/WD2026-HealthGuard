-- CreateTable
CREATE TABLE "ExamResult" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "doctorName" TEXT,
    "clinicName" TEXT,
    "examDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metrics" JSONB NOT NULL DEFAULT '[]',
    "appointment" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamResult_token_key" ON "ExamResult"("token");
