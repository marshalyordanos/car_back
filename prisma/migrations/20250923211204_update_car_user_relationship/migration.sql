-- DropForeignKey
ALTER TABLE "public"."Car" DROP CONSTRAINT "Car_hostId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Car" ADD CONSTRAINT "Car_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
