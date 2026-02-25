/*
  Warnings:

  - You are about to drop the column `status` on the `Event` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Event_status_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "status",
ADD COLUMN     "driveLink" VARCHAR(500),
ADD COLUMN     "youtubeLink" VARCHAR(500);

-- DropEnum
DROP TYPE "EventStatus";

-- CreateIndex
CREATE INDEX "Event_isPublished_idx" ON "Event"("isPublished");
