/*
  Warnings:

  - You are about to drop the column `useCaseId` on the `Sentence` table. All the data in the column will be lost.
  - You are about to drop the `UseCase` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `title` to the `Sentence` table without a default value. This is not possible if the table is not empty.
  - Added the required column `useCase` to the `Sentence` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Sentence" DROP CONSTRAINT "Sentence_useCaseId_fkey";

-- DropForeignKey
ALTER TABLE "UseCase" DROP CONSTRAINT "UseCase_wordId_fkey";

-- AlterTable
ALTER TABLE "Sentence" DROP COLUMN "useCaseId",
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "useCase" TEXT NOT NULL,
ADD COLUMN     "wordId" INTEGER;

-- DropTable
DROP TABLE "UseCase";

-- AddForeignKey
ALTER TABLE "Sentence" ADD CONSTRAINT "Sentence_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE SET NULL ON UPDATE CASCADE;
