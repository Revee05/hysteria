-- CreateTable
CREATE TABLE "TentangVisiMisi" (
    "id" SERIAL NOT NULL,
    "pageSlug" VARCHAR(100) NOT NULL DEFAULT 'tentang',
    "visi" TEXT NOT NULL,
    "misi" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TentangVisiMisi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TentangSejarahItem" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "imageUrl" VARCHAR(500),
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TentangSejarahItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TentangPanduanVisual" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "link" VARCHAR(500),
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TentangPanduanVisual_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TentangVisiMisi_pageSlug_key" ON "TentangVisiMisi"("pageSlug");

-- CreateIndex
CREATE INDEX "TentangVisiMisi_pageSlug_idx" ON "TentangVisiMisi"("pageSlug");

-- CreateIndex
CREATE INDEX "TentangSejarahItem_order_idx" ON "TentangSejarahItem"("order");

-- CreateIndex
CREATE INDEX "TentangSejarahItem_isActive_idx" ON "TentangSejarahItem"("isActive");

-- CreateIndex
CREATE INDEX "TentangPanduanVisual_order_idx" ON "TentangPanduanVisual"("order");

-- CreateIndex
CREATE INDEX "TentangPanduanVisual_isActive_idx" ON "TentangPanduanVisual"("isActive");
