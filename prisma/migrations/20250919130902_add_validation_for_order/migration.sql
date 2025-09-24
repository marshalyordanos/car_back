-- AlterEnum
ALTER TYPE "public"."OrderStatus" ADD VALUE 'VALIDATED';

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "validatedAt" TIMESTAMP(3),
ADD COLUMN     "validatedBy" TEXT,
ADD COLUMN     "validatedNotes" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_validatedBy_fkey" FOREIGN KEY ("validatedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
