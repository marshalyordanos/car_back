/*
  Warnings:

  - You are about to drop the column `carType` on the `Car` table. All the data in the column will be lost.
  - Added the required column `carTypeId` to the `Car` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Car" DROP COLUMN "carType",
ADD COLUMN     "carTypeId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."CarType";

-- CreateTable
CREATE TABLE "public"."CarType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarType_name_key" ON "public"."CarType"("name");

-- AddForeignKey
ALTER TABLE "public"."Car" ADD CONSTRAINT "Car_carTypeId_fkey" FOREIGN KEY ("carTypeId") REFERENCES "public"."CarType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
