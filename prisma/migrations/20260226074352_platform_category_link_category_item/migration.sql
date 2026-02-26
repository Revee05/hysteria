/*
  Warnings:

  - You are about to drop the column `slug` on the `PlatformCategory` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `PlatformCategory` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `PlatformCategory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[platformId,categoryItemId]` on the table `PlatformCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryItemId` to the `PlatformCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlatformCategory" DROP COLUMN "slug",
DROP COLUMN "title",
DROP COLUMN "url",
ADD COLUMN     "categoryItemId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "PlatformCategory_categoryItemId_idx" ON "PlatformCategory"("categoryItemId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformCategory_platformId_categoryItemId_key" ON "PlatformCategory"("platformId", "categoryItemId");

-- AddForeignKey
ALTER TABLE "PlatformCategory" ADD CONSTRAINT "PlatformCategory_categoryItemId_fkey" FOREIGN KEY ("categoryItemId") REFERENCES "CategoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
