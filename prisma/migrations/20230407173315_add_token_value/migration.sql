/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `AccessToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `AccessToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AccessToken" ADD COLUMN     "token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AccessToken_token_key" ON "AccessToken"("token");
