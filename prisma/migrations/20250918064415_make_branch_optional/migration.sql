-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_branchId_fkey";

-- AlterTable
ALTER TABLE "public"."Order" ALTER COLUMN "branchId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
