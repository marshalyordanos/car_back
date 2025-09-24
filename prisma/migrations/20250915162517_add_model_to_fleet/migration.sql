-- AlterTable
ALTER TABLE "public"."RefreshToken" ALTER COLUMN "expiresAt" SET DEFAULT (NOW() + interval '7 days');

-- AlterTable
ALTER TABLE "public"."Vehicle" ADD COLUMN     "model" TEXT;
