/*
  Warnings:

  - You are about to drop the column `wordId` on the `Sentence` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Sentence" DROP CONSTRAINT "Sentence_wordId_fkey";

-- AlterTable
ALTER TABLE "Sentence" DROP COLUMN "wordId",
ADD COLUMN     "useCaseId" INTEGER;

-- AddForeignKey
ALTER TABLE "Sentence" ADD CONSTRAINT "Sentence_useCaseId_fkey" FOREIGN KEY ("useCaseId") REFERENCES "UseCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
