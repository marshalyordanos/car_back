-- AlterTable
ALTER TABLE "public"."RefreshToken" ALTER COLUMN "expiresAt" SET DEFAULT (NOW() + interval '7 days');

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "roleId" DROP NOT NULL;
