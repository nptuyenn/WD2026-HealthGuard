-- CreateTable
CREATE TABLE "HealthMetric" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "valueNum" DOUBLE PRECISION NOT NULL,
    "valueNum2" DOUBLE PRECISION,
    "unit" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HealthMetric_profileId_idx" ON "HealthMetric"("profileId");

-- CreateIndex
CREATE INDEX "HealthMetric_profileId_metricType_recordedAt_idx" ON "HealthMetric"("profileId", "metricType", "recordedAt");

-- AddForeignKey
ALTER TABLE "HealthMetric" ADD CONSTRAINT "HealthMetric_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "HealthProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
