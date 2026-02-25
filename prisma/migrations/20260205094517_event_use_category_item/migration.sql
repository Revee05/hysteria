/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `mapsShortLink` on the `Event` table. All the data in the column will be lost.
  - Added the required column `categoryItemId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_categoryId_fkey";

-- DropIndex
DROP INDEX "Event_categoryId_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "categoryId",
DROP COLUMN "mapsShortLink",
ADD COLUMN     "categoryItemId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Event_categoryItemId_idx" ON "Event"("categoryItemId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_categoryItemId_fkey" FOREIGN KEY ("categoryItemId") REFERENCES "CategoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
