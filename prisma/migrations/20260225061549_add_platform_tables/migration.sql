-- CreateTable
CREATE TABLE "Platform" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "headline" VARCHAR(500),
    "subHeadline" TEXT,
    "instagram" VARCHAR(500),
    "youtube" VARCHAR(500),
    "youtubeProfile" VARCHAR(500),
    "mainImageUrl" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformImage" (
    "id" SERIAL NOT NULL,
    "platformId" INTEGER NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "title" VARCHAR(500),
    "subtitle" TEXT,
    "imageUrl" VARCHAR(500),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Platform_slug_key" ON "Platform"("slug");

-- CreateIndex
CREATE INDEX "Platform_slug_idx" ON "Platform"("slug");

-- CreateIndex
CREATE INDEX "PlatformImage_platformId_idx" ON "PlatformImage"("platformId");

-- CreateIndex
CREATE INDEX "PlatformImage_type_idx" ON "PlatformImage"("type");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformImage_platformId_key_key" ON "PlatformImage"("platformId", "key");

-- AddForeignKey
ALTER TABLE "PlatformImage" ADD CONSTRAINT "PlatformImage_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE CASCADE ON UPDATE CASCADE;
