-- CreateTable
CREATE TABLE "CollaborationContent" (
	"id" SERIAL NOT NULL,
	"pageKey" VARCHAR(100) NOT NULL,
	"googleFormUrl" TEXT NOT NULL,
	"whatsappNumber" VARCHAR(30) NOT NULL,
	"whatsappMessage" TEXT NOT NULL,
	"heroSubHeadline" TEXT,
	"heroNotes" TEXT,
	"whyBenefits" JSONB,
	"schemes" JSONB,
	"flowSteps" JSONB,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,

	CONSTRAINT "CollaborationContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CollaborationContent_pageKey_key" ON "CollaborationContent"("pageKey");
