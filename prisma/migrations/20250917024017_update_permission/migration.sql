/*
  Warnings:

  - You are about to drop the column `createAction` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `deleteAction` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `readAction` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `updateAction` on the `Permission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Permission" DROP COLUMN "createAction",
DROP COLUMN "deleteAction",
DROP COLUMN "readAction",
DROP COLUMN "updateAction";

-- AlterTable
ALTER TABLE "public"."RefreshToken" ALTER COLUMN "expiresAt" SET DEFAULT (NOW() + interval '7 days');

-- AlterTable
ALTER TABLE "public"."RolePermission" ADD COLUMN     "createAction" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deleteAction" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readAction" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updateAction" BOOLEAN NOT NULL DEFAULT false;
