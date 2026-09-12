-- AlterTable
ALTER TABLE "Scheme" ADD COLUMN     "benefits" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'AGRICULTURE',
ADD COLUMN     "lastVerified" TIMESTAMP(3),
ADD COLUMN     "requiredDocuments" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "sourceLabel" TEXT NOT NULL DEFAULT 'Sahayak demonstration catalogue (fictional)',
ADD COLUMN     "targetGroups" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;
