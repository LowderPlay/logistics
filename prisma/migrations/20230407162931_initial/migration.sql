-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SECURITY', 'STOREKEEPER');

-- CreateEnum
CREATE TYPE "DeliveryState" AS ENUM ('SCHEDULED', 'ARRIVED', 'WAITING', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" INTEGER NOT NULL,
    "state" "DeliveryState" NOT NULL,
    "truck" TEXT NOT NULL,
    "driver_name" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "stockTypeId" INTEGER NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "StockType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_id_key" ON "Delivery"("id");

-- CreateIndex
CREATE UNIQUE INDEX "StockType_id_key" ON "StockType"("id");

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_stockTypeId_fkey" FOREIGN KEY ("stockTypeId") REFERENCES "StockType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
