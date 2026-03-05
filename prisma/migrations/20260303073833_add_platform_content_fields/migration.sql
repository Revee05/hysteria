-- CreateTable
CREATE TABLE "PlatformContent" (
    "id" SERIAL NOT NULL,
    "platformId" INTEGER NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "url" VARCHAR(500),
    "year" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformContent_platformId_idx" ON "PlatformContent"("platformId");

-- CreateIndex
CREATE INDEX "PlatformContent_order_idx" ON "PlatformContent"("order");

-- CreateIndex
CREATE INDEX "PlatformContent_isActive_idx" ON "PlatformContent"("isActive");

-- AddForeignKey
ALTER TABLE "PlatformContent" ADD CONSTRAINT "PlatformContent_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE CASCADE ON UPDATE CASCADE;
