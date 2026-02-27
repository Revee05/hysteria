/*
  Warnings:

  - You are about to drop the column `categoryItemId` on the `Event` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_categoryItemId_fkey";

-- DropIndex
DROP INDEX "Event_categoryItemId_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "categoryItemId",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "tags" VARCHAR(50)[];

-- CreateTable
CREATE TABLE "EventCategory" (
    "eventId" INTEGER NOT NULL,
    "categoryItemId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EventCategory_pkey" PRIMARY KEY ("eventId","categoryItemId")
);

-- CreateIndex
CREATE INDEX "EventCategory_eventId_idx" ON "EventCategory"("eventId");

-- CreateIndex
CREATE INDEX "EventCategory_categoryItemId_idx" ON "EventCategory"("categoryItemId");

-- CreateIndex
CREATE INDEX "Event_endAt_idx" ON "Event"("endAt");

-- AddForeignKey
ALTER TABLE "EventCategory" ADD CONSTRAINT "EventCategory_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCategory" ADD CONSTRAINT "EventCategory_categoryItemId_fkey" FOREIGN KEY ("categoryItemId") REFERENCES "CategoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
