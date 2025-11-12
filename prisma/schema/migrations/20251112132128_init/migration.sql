-- CreateTable
CREATE TABLE "repos" (
    "id" SERIAL NOT NULL,
    "gitlabId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "lastActivity" TIMESTAMP(3) NOT NULL,
    "visibility" TEXT NOT NULL,
    "chromaUpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Processing" (
    "id" SERIAL NOT NULL,
    "processingTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "minutes" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT NOT NULL,

    CONSTRAINT "Processing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commit" (
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

    CONSTRAINT "Commit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "repos_gitlabId_key" ON "repos"("gitlabId");

-- CreateIndex
CREATE UNIQUE INDEX "Commit_gitlabId_key" ON "Commit"("gitlabId");

-- AddForeignKey
ALTER TABLE "Commit" ADD CONSTRAINT "Commit_processingId_fkey" FOREIGN KEY ("processingId") REFERENCES "Processing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
