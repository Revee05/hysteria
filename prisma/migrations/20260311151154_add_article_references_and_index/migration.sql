-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "featuredImageSource" VARCHAR(255),
ADD COLUMN     "references" JSONB;

-- CreateIndex
CREATE INDEX "Article_status_publishedAt_idx" ON "Article"("status", "publishedAt");
