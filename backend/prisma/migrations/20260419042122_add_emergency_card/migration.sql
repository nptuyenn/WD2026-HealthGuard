-- CreateTable
CREATE TABLE "EmergencyCard" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "conditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contacts" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "publicToken" TEXT NOT NULL,
    "tokenRevokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyCard_profileId_key" ON "EmergencyCard"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyCard_publicToken_key" ON "EmergencyCard"("publicToken");

-- CreateIndex
CREATE INDEX "EmergencyCard_publicToken_idx" ON "EmergencyCard"("publicToken");

-- AddForeignKey
ALTER TABLE "EmergencyCard" ADD CONSTRAINT "EmergencyCard_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "HealthProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
