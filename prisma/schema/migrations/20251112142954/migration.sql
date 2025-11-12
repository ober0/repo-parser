-- AlterTable
ALTER TABLE "commit" ALTER COLUMN "message" DROP NOT NULL;

-- AlterTable
ALTER TABLE "repos" ALTER COLUMN "description" DROP NOT NULL;
