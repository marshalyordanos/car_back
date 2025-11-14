/*
  Warnings:

  - You are about to drop the column `method` on the `Payout` table. All the data in the column will be lost.
  - Added the required column `accountNumber` to the `Payout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankType` to the `Payout` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."BankType" AS ENUM ('TELEBIRR', 'ABYSSINIA', 'AWASH', 'COMMERCIAL_BANK_OF_ETHIOPIA', 'DASHEN', 'NIB', 'ZEMEN', 'ABAY', 'WEGAGEN', 'UNITED', 'ADDIS_INTERNATIONAL', 'BERHAN', 'COOPERATIVE_BANK_OF_OROMIA', 'ENAT', 'HIWOT', 'LION', 'BUNA', 'DEBUB_GLOBAL', 'OROMIA_INTERNATIONAL', 'AMHARA', 'HIJRA', 'SIINQEE', 'SHABELLE', 'GADA', 'GEBEYA', 'TSEDEY', 'RAYAN', 'TSEDAY', 'LILA_ABBISINIA', 'OTHER');

-- AlterTable
ALTER TABLE "public"."Payout" DROP COLUMN "method",
ADD COLUMN     "accountNumber" TEXT NOT NULL,
ADD COLUMN     "bankType" "public"."BankType" NOT NULL,
ADD COLUMN     "reason" TEXT;
