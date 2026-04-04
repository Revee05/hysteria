-- AlterTable
ALTER TABLE "ContactSection" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PlatformContent" ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;
