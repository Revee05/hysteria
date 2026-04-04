-- CreateTable
CREATE TABLE "PlatformCategory" (
    "id" SERIAL NOT NULL,
    "platformId" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "layout" VARCHAR(50) NOT NULL DEFAULT 'grid',
    "description" TEXT,
    "filters" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformCategory_platformId_idx" ON "PlatformCategory"("platformId");

-- CreateIndex
CREATE INDEX "PlatformCategory_order_idx" ON "PlatformCategory"("order");

-- AddForeignKey
ALTER TABLE "PlatformCategory" ADD CONSTRAINT "PlatformCategory_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE CASCADE ON UPDATE CASCADE;
