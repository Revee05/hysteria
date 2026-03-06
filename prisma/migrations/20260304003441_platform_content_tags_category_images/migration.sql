-- AlterTable
ALTER TABLE "PlatformContent" ADD COLUMN     "categoryItemId" INTEGER,
ADD COLUMN     "tags" TEXT[];

-- CreateTable
CREATE TABLE "PlatformContentImage" (
    "id" SERIAL NOT NULL,
    "contentId" INTEGER NOT NULL,
    "imageUrl" VARCHAR(500),
    "type" VARCHAR(50) NOT NULL DEFAULT 'thumbnail',
    "alt" VARCHAR(255),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformContentImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformContentImage_contentId_idx" ON "PlatformContentImage"("contentId");

-- CreateIndex
CREATE INDEX "PlatformContentImage_type_idx" ON "PlatformContentImage"("type");

-- CreateIndex
CREATE INDEX "PlatformContent_categoryItemId_idx" ON "PlatformContent"("categoryItemId");

-- AddForeignKey
ALTER TABLE "PlatformContent" ADD CONSTRAINT "PlatformContent_categoryItemId_fkey" FOREIGN KEY ("categoryItemId") REFERENCES "CategoryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformContentImage" ADD CONSTRAINT "PlatformContentImage_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "PlatformContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
