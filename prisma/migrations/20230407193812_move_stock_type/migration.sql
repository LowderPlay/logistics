/*
  Warnings:

  - You are about to drop the column `driver_name` on the `Delivery` table. All the data in the column will be lost.
  - You are about to drop the column `stockTypeId` on the `Delivery` table. All the data in the column will be lost.
  - You are about to drop the `StockType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `driverName` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stockType` to the `Delivery` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Delivery" DROP CONSTRAINT "Delivery_stockTypeId_fkey";

-- AlterTable
ALTER TABLE "Delivery" DROP COLUMN "driver_name",
DROP COLUMN "stockTypeId",
ADD COLUMN     "driverName" TEXT NOT NULL,
ADD COLUMN     "stockType" TEXT NOT NULL;

-- DropTable
DROP TABLE "StockType";
