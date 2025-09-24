-- CreateEnum
CREATE TYPE "public"."FulfillmentType" AS ENUM ('PICKUP', 'DROPOFF');

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "actualDropoffDate" TIMESTAMP(3),
ADD COLUMN     "actualPickupDate" TIMESTAMP(3),
ADD COLUMN     "dropoffConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fulfillmentType" "public"."FulfillmentType" NOT NULL DEFAULT 'PICKUP',
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "pickupConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pickupDate" TIMESTAMP(3),
ALTER COLUMN "pickupAddress" DROP NOT NULL;
