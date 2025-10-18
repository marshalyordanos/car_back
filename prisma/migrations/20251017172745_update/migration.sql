-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('CAPTURE', 'REFUND', 'HOLD');

-- CreateEnum
CREATE TYPE "public"."InspectionType" AS ENUM ('PICKUP', 'DROPOFF');

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "insuranceFee" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "public"."PaymentTransaction" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "type" "public"."TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BookingInsurance" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "plan" "public"."InsurancePlan" NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'Platform Insurance',
    "coverageDetails" TEXT,
    "cost" DOUBLE PRECISION NOT NULL,
    "isRefundable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingInsurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BookingInspection" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "type" "public"."InspectionType" NOT NULL,
    "photos" TEXT[],
    "fuelLevel" DOUBLE PRECISION NOT NULL,
    "mileage" INTEGER NOT NULL,
    "submittedById" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CancellationPolicy" (
    "id" TEXT NOT NULL,
    "userType" "public"."UserRole" NOT NULL,
    "daysBeforeTrip" INTEGER NOT NULL,
    "refundPercent" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CancellationPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HostPenalty" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostPenalty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingInsurance_bookingId_key" ON "public"."BookingInsurance"("bookingId");

-- AddForeignKey
ALTER TABLE "public"."PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingInsurance" ADD CONSTRAINT "BookingInsurance_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingInspection" ADD CONSTRAINT "BookingInspection_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingInspection" ADD CONSTRAINT "BookingInspection_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingInspection" ADD CONSTRAINT "BookingInspection_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HostPenalty" ADD CONSTRAINT "HostPenalty_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HostPenalty" ADD CONSTRAINT "HostPenalty_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
