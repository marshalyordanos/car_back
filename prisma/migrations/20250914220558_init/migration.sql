-- AlterTable
ALTER TABLE "public"."RefreshToken" ALTER COLUMN "expiresAt" SET DEFAULT (NOW() + interval '7 days');
