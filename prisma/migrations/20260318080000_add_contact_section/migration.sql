-- CreateTable
CREATE TABLE IF NOT EXISTS "ContactSection" (
  "id" SERIAL NOT NULL,
  "mapsEmbedUrl" TEXT,
  "locationTitle" VARCHAR(255),
  "locationAddress" TEXT,
  "operationalHours" TEXT,
  "whatsappNumber" VARCHAR(255),
  "instagramUrl" VARCHAR(500),
  "twitterUrl" VARCHAR(500),
  "facebookUrl" VARCHAR(500),
  "youtubeUrl" VARCHAR(500),
  "tiktokUrl" VARCHAR(500),
  "email" VARCHAR(255),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ContactSection_pkey" PRIMARY KEY ("id")
);

-- Index for fast lookups of active row
CREATE INDEX IF NOT EXISTS "ContactSection_isActive_idx" ON "ContactSection"("isActive");
