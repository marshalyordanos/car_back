-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."NotificationType" ADD VALUE 'BOOKING';
ALTER TYPE "public"."NotificationType" ADD VALUE 'DISPUTE';
ALTER TYPE "public"."NotificationType" ADD VALUE 'PAYMENT';

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "trackingCode" TEXT;

-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "bookingId" TEXT,
ADD COLUMN     "disputeId" TEXT,
ADD COLUMN     "paymentId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "public"."Dispute"("id") ON DELETE SET NULL ON UPDATE CASCADE;
