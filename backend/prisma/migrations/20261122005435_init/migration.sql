-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('LOST', 'FOUND');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('ELECTRONICS', 'TUMBLER', 'ID_CARD', 'ACCESSORIES', 'MISCELLANEOUS');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('WHATSAPP', 'LINE', 'INSTAGRAM', 'DISCORD', 'EMAIL');

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" VARCHAR(1000) NOT NULL,
    "type" "ReportType" NOT NULL,
    "category" "Category" NOT NULL,
    "location" VARCHAR(120) NOT NULL,
    "date" DATE NOT NULL,
    "imageUrl" VARCHAR(2048),
    "reporterName" VARCHAR(80) NOT NULL,
    "contactType" "ContactType" NOT NULL,
    "contactValue" VARCHAR(120) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_createdAt_idx" ON "reports"("createdAt");
