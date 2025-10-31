/*
  Warnings:

  - A unique constraint covering the columns `[trackingCode]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Booking_trackingCode_key" ON "public"."Booking"("trackingCode");
