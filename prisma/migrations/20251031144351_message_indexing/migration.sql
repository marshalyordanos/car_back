-- CreateIndex
CREATE INDEX "idx_message_bookingid_createdat" ON "public"."Message"("bookingId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_message_receiverid_isread" ON "public"."Message"("receiverId", "isRead");

-- CreateIndex
CREATE INDEX "idx_message_bookingid_id" ON "public"."Message"("bookingId", "id" DESC);
