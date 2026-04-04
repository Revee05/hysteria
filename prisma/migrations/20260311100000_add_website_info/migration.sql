-- CreateTable
CREATE TABLE IF NOT EXISTS "WebsiteInfo" (
  "id" SERIAL NOT NULL,
  "pageKey" VARCHAR(50) NOT NULL DEFAULT 'default',
  "judul" VARCHAR(255),
  "deskripsi" TEXT,
  "deskripsiFooter" TEXT,
  "logoWebsite" TEXT,
  "faviconWebsite" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WebsiteInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WebsiteInfo_pageKey_key" ON "WebsiteInfo"("pageKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WebsiteInfo_pageKey_idx" ON "WebsiteInfo"("pageKey");
