/*
  Warnings:

  - You are about to drop the column `read` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isStaff` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isSuperAdmin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Bookmark` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Bookmark2` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Branch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmailVerification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FleetLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Mfa` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderException` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderTracking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ParcelApproval` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PasswordReset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pricing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RefreshToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserPreferences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vehicle` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[transactionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `userId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `method` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('GUEST', 'HOST', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."Transmission" AS ENUM ('AUTOMATIC', 'MANUAL');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('PROMOTION', 'ALERT', 'MESSAGE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."InsurancePlan" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "public"."ReviewType" AS ENUM ('HOST_TO_GUEST', 'GUEST_TO_HOST', 'GUEST_TO_CAR');

-- AlterEnum
ALTER TYPE "public"."PaymentStatus" ADD VALUE 'REFUNDED';

-- DropForeignKey
ALTER TABLE "public"."Address" DROP CONSTRAINT "Address_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Bookmark" DROP CONSTRAINT "Bookmark_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Branch" DROP CONSTRAINT "Branch_managerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EmailVerification" DROP CONSTRAINT "EmailVerification_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FleetLog" DROP CONSTRAINT "FleetLog_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Mfa" DROP CONSTRAINT "Mfa_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_driverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_validatedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderException" DROP CONSTRAINT "OrderException_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderTracking" DROP CONSTRAINT "OrderTracking_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ParcelApproval" DROP CONSTRAINT "ParcelApproval_decisionBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."ParcelApproval" DROP CONSTRAINT "ParcelApproval_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PasswordReset" DROP CONSTRAINT "PasswordReset_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserPreferences" DROP CONSTRAINT "UserPreferences_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Vehicle" DROP CONSTRAINT "Vehicle_driverId_fkey";

-- DropIndex
DROP INDEX "public"."Payment_orderId_key";

-- DropIndex
DROP INDEX "public"."User_phone_key";

-- AlterTable
ALTER TABLE "public"."Notification" DROP COLUMN "read",
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "public"."NotificationType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "orderId",
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "userId" TEXT NOT NULL,
DROP COLUMN "method",
ADD COLUMN     "method" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "branchId",
DROP COLUMN "emailVerified",
DROP COLUMN "isStaff",
DROP COLUMN "isSuperAdmin",
DROP COLUMN "name",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "profilePhoto" TEXT;

-- DropTable
DROP TABLE "public"."Address";

-- DropTable
DROP TABLE "public"."AuditLog";

-- DropTable
DROP TABLE "public"."Bookmark";

-- DropTable
DROP TABLE "public"."Bookmark2";

-- DropTable
DROP TABLE "public"."Branch";

-- DropTable
DROP TABLE "public"."EmailVerification";

-- DropTable
DROP TABLE "public"."FleetLog";

-- DropTable
DROP TABLE "public"."Mfa";

-- DropTable
DROP TABLE "public"."Order";

-- DropTable
DROP TABLE "public"."OrderException";

-- DropTable
DROP TABLE "public"."OrderTracking";

-- DropTable
DROP TABLE "public"."ParcelApproval";

-- DropTable
DROP TABLE "public"."PasswordReset";

-- DropTable
DROP TABLE "public"."Pricing";

-- DropTable
DROP TABLE "public"."RefreshToken";

-- DropTable
DROP TABLE "public"."UserPreferences";

-- DropTable
DROP TABLE "public"."Vehicle";

-- DropEnum
DROP TYPE "public"."ApprovalStatus";

-- DropEnum
DROP TYPE "public"."FulfillmentType";

-- DropEnum
DROP TYPE "public"."OrderStatus";

-- DropEnum
DROP TYPE "public"."ParcelCategory";

-- DropEnum
DROP TYPE "public"."PaymentMethod";

-- DropEnum
DROP TYPE "public"."ServiceType";

-- DropEnum
DROP TYPE "public"."ShipmentType";

-- DropEnum
DROP TYPE "public"."ShippingScope";

-- DropEnum
DROP TYPE "public"."VehicleStatus";

-- CreateTable
CREATE TABLE "public"."GuestProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT,
    "driverLicenseId" TEXT,
    "nationalId" TEXT,

    CONSTRAINT "GuestProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HostProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "payoutMethod" TEXT,
    "earnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "HostProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CarMake" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarMake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CarModel" (
    "id" TEXT NOT NULL,
    "makeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Car" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "makeId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "transmission" "public"."Transmission" NOT NULL,
    "mileage" INTEGER NOT NULL,
    "dailyRate" DOUBLE PRECISION NOT NULL,
    "longTermDiscount" DOUBLE PRECISION,
    "mileageLimit" INTEGER,
    "features" TEXT[],
    "photos" TEXT[],
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CarInsurance" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "plan" "public"."InsurancePlan" NOT NULL,
    "provider" TEXT NOT NULL,
    "coverageDetails" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarInsurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "id" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT,
    "carId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "type" "public"."ReviewType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminAction" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discount" DOUBLE PRECISION NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_Wishlist" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_Wishlist_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestProfile_userId_key" ON "public"."GuestProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HostProfile_userId_key" ON "public"."HostProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CarMake_name_key" ON "public"."CarMake"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "public"."PromoCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "public"."SystemSetting"("key");

-- CreateIndex
CREATE INDEX "_Wishlist_B_index" ON "public"."_Wishlist"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "public"."Payment"("transactionId");

-- AddForeignKey
ALTER TABLE "public"."GuestProfile" ADD CONSTRAINT "GuestProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HostProfile" ADD CONSTRAINT "HostProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CarModel" ADD CONSTRAINT "CarModel_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "public"."CarMake"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Car" ADD CONSTRAINT "Car_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "public"."HostProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Car" ADD CONSTRAINT "Car_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "public"."CarMake"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Car" ADD CONSTRAINT "Car_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."CarModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CarInsurance" ADD CONSTRAINT "CarInsurance_carId_fkey" FOREIGN KEY ("carId") REFERENCES "public"."Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_carId_fkey" FOREIGN KEY ("carId") REFERENCES "public"."Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminAction" ADD CONSTRAINT "AdminAction_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_Wishlist" ADD CONSTRAINT "_Wishlist_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_Wishlist" ADD CONSTRAINT "_Wishlist_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."GuestProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
