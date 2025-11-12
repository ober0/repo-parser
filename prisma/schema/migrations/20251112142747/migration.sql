/*
  Warnings:

  - You are about to drop the column `visibility` on the `repos` table. All the data in the column will be lost.
  - You are about to drop the `Commit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Processing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Commit" DROP CONSTRAINT "Commit_processingId_fkey";

-- AlterTable
ALTER TABLE "repos" DROP COLUMN "visibility";

-- DropTable
DROP TABLE "Commit";

-- DropTable
DROP TABLE "Processing";

-- CreateTable
CREATE TABLE "processing" (
    "id" SERIAL NOT NULL,
    "processingTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "minutes" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT NOT NULL,

    CONSTRAINT "processing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commit" (
    "id" SERIAL NOT NULL,
    "gitlabId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "added" TEXT[],
    "modified" TEXT[],
    "removed" TEXT[],
    "processingId" INTEGER,

    CONSTRAINT "commit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commit_gitlabId_key" ON "commit"("gitlabId");

-- AddForeignKey
ALTER TABLE "commit" ADD CONSTRAINT "commit_processingId_fkey" FOREIGN KEY ("processingId") REFERENCES "processing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
