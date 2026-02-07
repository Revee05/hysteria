-- CreateTable
CREATE TABLE "TeamCategory" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "role" VARCHAR(255) NOT NULL,
    "imageUrl" VARCHAR(500),
    "email" VARCHAR(255),
    "instagram" VARCHAR(255),
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamCategory_slug_idx" ON "TeamCategory"("slug");

-- CreateIndex
CREATE INDEX "TeamCategory_order_idx" ON "TeamCategory"("order");

-- CreateIndex
CREATE UNIQUE INDEX "TeamCategory_slug_name_key" ON "TeamCategory"("slug", "name");

-- CreateIndex
CREATE INDEX "TeamMember_categoryId_idx" ON "TeamMember"("categoryId");

-- CreateIndex
CREATE INDEX "TeamMember_order_idx" ON "TeamMember"("order");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_slug_name_key" ON "TeamMember"("slug", "name");

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TeamCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
