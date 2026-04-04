-- AlterTable
ALTER TABLE "WebsiteInfo" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "HomepagePlatformCard" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "imageUrl" VARCHAR(500),
    "linkUrl" VARCHAR(500),
    "slotType" VARCHAR(20) NOT NULL DEFAULT 'tall',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepagePlatformCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomepagePlatformCard_order_idx" ON "HomepagePlatformCard"("order");

-- CreateIndex
CREATE INDEX "HomepagePlatformCard_isActive_idx" ON "HomepagePlatformCard"("isActive");
