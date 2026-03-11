-- AlterTable
ALTER TABLE "CategoryItem" ADD COLUMN     "isIndependent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "instagramLiveLink" VARCHAR(500),
ADD COLUMN     "tiktokLiveLink" VARCHAR(500),
ADD COLUMN     "youtubeLiveLink" VARCHAR(500);
