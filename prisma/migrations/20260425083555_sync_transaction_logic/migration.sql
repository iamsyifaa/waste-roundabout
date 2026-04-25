/*
  Warnings:

  - The values [USER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isCollected` on the `WastePost` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "WastePostStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'SOLD');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('FARMER', 'COLLECTOR', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'FARMER';
COMMIT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "finalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "role" SET DEFAULT 'FARMER';

-- AlterTable
ALTER TABLE "WasteCategory" ADD COLUMN     "basePricePerKg" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "WastePost" DROP COLUMN "isCollected",
ADD COLUMN     "status" "WastePostStatus" NOT NULL DEFAULT 'AVAILABLE';
