/*
  Warnings:

  - You are about to drop the column `coverageDetails` on the `CarInsurance` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `CarInsurance` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `CarInsurance` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `CarInsurance` table. All the data in the column will be lost.
  - Added the required column `expiryDate` to the `CarInsurance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `insuranceCompany` to the `CarInsurance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `insuranceType` to the `CarInsurance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `policyNumber` to the `CarInsurance` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."InsuranceType" AS ENUM ('THIRD_PARTY', 'COMPREHENSIVE');

-- AlterTable
ALTER TABLE "public"."Car" ADD COLUMN     "gpsDeviceBrand" TEXT,
ADD COLUMN     "gpsImeiNumber" TEXT,
ADD COLUMN     "gpsInstallationReceiptUrl" TEXT,
ADD COLUMN     "gpsPlatformPassword" TEXT,
ADD COLUMN     "gpsPlatformUrl" TEXT,
ADD COLUMN     "gpsPlatformUsername" TEXT,
ADD COLUMN     "gpsSubscriptionExpiryDate" TIMESTAMP(3),
ADD COLUMN     "hasGPS" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "technicalInspectionCertificateUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."CarInsurance" DROP COLUMN "coverageDetails",
DROP COLUMN "isActive",
DROP COLUMN "plan",
DROP COLUMN "provider",
ADD COLUMN     "documentFile" TEXT,
ADD COLUMN     "expiryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "insuranceCompany" TEXT NOT NULL,
ADD COLUMN     "insuranceType" "public"."InsuranceType" NOT NULL,
ADD COLUMN     "policyNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "isActive" SET DEFAULT true;
