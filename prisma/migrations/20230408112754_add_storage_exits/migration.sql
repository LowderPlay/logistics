-- CreateEnum
CREATE TYPE "Storage" AS ENUM ('SOUTH', 'NORTH');

-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "storage" "Storage";
