/*
  Warnings:

  - You are about to drop the column `isCors` on the `Api` table. All the data in the column will be lost.
  - You are about to drop the column `isCors` on the `Proposal` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CorsStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'UNKNOWN');

-- AlterTable
ALTER TABLE "Api" DROP COLUMN "isCors",
ADD COLUMN     "corsStatus" "CorsStatus" NOT NULL DEFAULT 'UNKNOWN';

-- AlterTable
ALTER TABLE "Proposal" DROP COLUMN "isCors",
ADD COLUMN     "corsStatus" "CorsStatus" NOT NULL DEFAULT 'UNKNOWN';
