/*
  Warnings:

  - A unique constraint covering the columns `[webhookSecret]` on the table `Repository` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Repository" ADD COLUMN     "customConfig" JSONB,
ADD COLUMN     "webhookSecret" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Repository_webhookSecret_key" ON "Repository"("webhookSecret");
