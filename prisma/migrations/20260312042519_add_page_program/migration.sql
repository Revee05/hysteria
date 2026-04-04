-- CreateTable
CREATE TABLE "PageProgram" (
    "id" SERIAL NOT NULL,
    "pageSlug" VARCHAR(100) NOT NULL DEFAULT 'program',
    "mainHero" JSONB,
    "covers" JSONB,
    "slugHeros" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageProgram_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PageProgram_pageSlug_key" ON "PageProgram"("pageSlug");

-- CreateIndex
CREATE INDEX "PageProgram_pageSlug_idx" ON "PageProgram"("pageSlug");
