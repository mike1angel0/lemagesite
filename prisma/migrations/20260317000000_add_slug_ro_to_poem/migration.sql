-- AlterTable
ALTER TABLE "Poem" ADD COLUMN "slugRo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Poem_slugRo_key" ON "Poem"("slugRo");
