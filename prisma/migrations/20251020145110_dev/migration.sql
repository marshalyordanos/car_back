/*
  Warnings:

  - Added the required column `bookingId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."TransactionType" ADD VALUE 'GUEST_TO_PLATFORM';
ALTER TYPE "public"."TransactionType" ADD VALUE 'PLATFORM_TO_HOST';

-- DropForeignKey
ALTER TABLE "public"."AdminAction" DROP CONSTRAINT "AdminAction_adminId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_carId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_guestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_hostId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingInspection" DROP CONSTRAINT "BookingInspection_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingInspection" DROP CONSTRAINT "BookingInspection_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingInspection" DROP CONSTRAINT "BookingInspection_submittedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingInsurance" DROP CONSTRAINT "BookingInsurance_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Car" DROP CONSTRAINT "Car_hostId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Car" DROP CONSTRAINT "Car_makeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Car" DROP CONSTRAINT "Car_modelId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CarInsurance" DROP CONSTRAINT "CarInsurance_carId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CarModel" DROP CONSTRAINT "CarModel_makeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Dispute" DROP CONSTRAINT "Dispute_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Dispute" DROP CONSTRAINT "Dispute_carId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Dispute" DROP CONSTRAINT "Dispute_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Dispute" DROP CONSTRAINT "Dispute_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GuestProfile" DROP CONSTRAINT "GuestProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HostPenalty" DROP CONSTRAINT "HostPenalty_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HostPenalty" DROP CONSTRAINT "HostPenalty_hostId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HostProfile" DROP CONSTRAINT "HostProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_payerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_recipientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PaymentTransaction" DROP CONSTRAINT "PaymentTransaction_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_carId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_revieweeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_reviewerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RolePermission" DROP CONSTRAINT "RolePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RolePermission" DROP CONSTRAINT "RolePermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_roleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_Wishlist" DROP CONSTRAINT "_Wishlist_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_Wishlist" DROP CONSTRAINT "_Wishlist_B_fkey";

-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "bookingId" TEXT NOT NULL;
