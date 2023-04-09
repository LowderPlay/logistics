/*
  Warnings:

  - The primary key for the `Delivery` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Delivery" DROP CONSTRAINT "Delivery_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id");
