/*
  Warnings:

  - Added the required column `carType` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rentalPricePerDay` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seatingCapacity` to the `Car` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."CarType" AS ENUM ('SEDAN', 'SUV', 'VAN', 'TRUCK', 'COUPE', 'CONVERTIBLE', 'HATCHBACK', 'WAGON', 'LUXURY', 'SPORTS', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."EcoFriendly" AS ENUM ('NONE', 'HYBRID', 'ELECTRIC');

-- AlterTable
ALTER TABLE "public"."Car" ADD COLUMN     "average_rating" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "carType" "public"."CarType" NOT NULL,
ADD COLUMN     "ecoFriendly" "public"."EcoFriendly" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "rentalPricePerDay" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "rules" TEXT[],
ADD COLUMN     "safety" TEXT[],
ADD COLUMN     "seatingCapacity" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."Dispute" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT,
    "carId" TEXT,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Dispute" ADD CONSTRAINT "Dispute_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Dispute" ADD CONSTRAINT "Dispute_carId_fkey" FOREIGN KEY ("carId") REFERENCES "public"."Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Dispute" ADD CONSTRAINT "Dispute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
