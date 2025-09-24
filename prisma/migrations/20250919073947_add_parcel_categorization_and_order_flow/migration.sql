/*
  Warnings:

  - You are about to drop the column `size` on the `Order` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ParcelCategory" AS ENUM ('DOCUMENT', 'ELECTRONICS', 'FOOD', 'FRAGILE_ITEM', 'CHEMICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ShipmentType" AS ENUM ('PARCEL', 'CARRIER');

-- CreateEnum
CREATE TYPE "public"."ShippingScope" AS ENUM ('REGIONAL', 'TOWN', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "public"."ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ESCALATED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."OrderStatus" ADD VALUE 'CREATED';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'PENDING_APPROVAL';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'REJECTED';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'ASSIGNED';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'READY_FOR_PICKUP';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'PICKUP_ATTEMPTED';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'PICKED_UP';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'OUT_FOR_DELIVERY';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'DROPOFF_ATTEMPTED';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'DROPPED_OFF';


-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "size",
ADD COLUMN     "category" "public"."ParcelCategory",
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "isFragile" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isUnusual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "length" DOUBLE PRECISION,
ADD COLUMN     "shipmentType" "public"."ShipmentType",
ADD COLUMN     "shippingScope" "public"."ShippingScope",
ADD COLUMN     "unusualReason" TEXT,
ADD COLUMN     "width" DOUBLE PRECISION,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."Vehicle" ADD COLUMN     "model" TEXT;

-- CreateTable
CREATE TABLE "public"."ParcelApproval" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "public"."ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "decisionBy" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParcelApproval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParcelApproval_orderId_key" ON "public"."ParcelApproval"("orderId");

-- AddForeignKey
ALTER TABLE "public"."ParcelApproval" ADD CONSTRAINT "ParcelApproval_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ParcelApproval" ADD CONSTRAINT "ParcelApproval_decisionBy_fkey" FOREIGN KEY ("decisionBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
