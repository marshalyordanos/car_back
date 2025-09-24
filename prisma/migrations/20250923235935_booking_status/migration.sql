/*
  Warnings:

  - The values [CANCELLED] on the enum `BookingStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."BookingStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED_BY_GUEST', 'CANCELLED_BY_HOST', 'CANCELLED_BY_ADMIN', 'COMPLETED');
ALTER TABLE "public"."Booking" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Booking" ALTER COLUMN "status" TYPE "public"."BookingStatus_new" USING ("status"::text::"public"."BookingStatus_new");
ALTER TYPE "public"."BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "public"."BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "public"."BookingStatus_old";
ALTER TABLE "public"."Booking" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
