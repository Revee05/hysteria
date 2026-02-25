-- CreateTable
CREATE TABLE "PageHero" (
    "id" SERIAL NOT NULL,
    "pageSlug" VARCHAR(100) NOT NULL,
    "imageUrl" VARCHAR(500) NOT NULL,
    "title" VARCHAR(500),
    "subtitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageHero_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PageHero_pageSlug_key" ON "PageHero"("pageSlug");

-- CreateIndex
CREATE INDEX "PageHero_pageSlug_idx" ON "PageHero"("pageSlug");
