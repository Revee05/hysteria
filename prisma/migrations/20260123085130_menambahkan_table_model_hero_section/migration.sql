-- CreateTable
CREATE TABLE "HeroSection" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSection_pkey" PRIMARY KEY ("id")
);
