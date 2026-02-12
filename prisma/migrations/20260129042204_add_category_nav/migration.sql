-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiredPermissionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryItem" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255),
    "url" VARCHAR(500),
    "order" INTEGER NOT NULL DEFAULT 0,
    "meta" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_order_idx" ON "Category"("order");

-- CreateIndex
CREATE INDEX "CategoryItem_categoryId_idx" ON "CategoryItem"("categoryId");

-- CreateIndex
CREATE INDEX "CategoryItem_parentId_idx" ON "CategoryItem"("parentId");

-- CreateIndex
CREATE INDEX "CategoryItem_order_idx" ON "CategoryItem"("order");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_requiredPermissionId_fkey" FOREIGN KEY ("requiredPermissionId") REFERENCES "Permission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryItem" ADD CONSTRAINT "CategoryItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryItem" ADD CONSTRAINT "CategoryItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CategoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
