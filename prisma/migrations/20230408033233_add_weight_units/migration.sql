-- CreateEnum
CREATE TYPE "WeightUnit" AS ENUM ('TONNE', 'KILOGRAM');

-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "weightUnit" "WeightUnit" NOT NULL DEFAULT 'TONNE';
