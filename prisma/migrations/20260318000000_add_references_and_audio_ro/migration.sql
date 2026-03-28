-- AlterTable
ALTER TABLE "Essay" ADD COLUMN "references" TEXT;
ALTER TABLE "Essay" ADD COLUMN "audioUrlRo" TEXT;

-- AlterTable
ALTER TABLE "ResearchPaper" ADD COLUMN "references" TEXT;
ALTER TABLE "ResearchPaper" ADD COLUMN "audioUrlRo" TEXT;

-- AlterTable
ALTER TABLE "Poem" ADD COLUMN "audioUrlRo" TEXT;
