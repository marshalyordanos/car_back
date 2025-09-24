/*
  Warnings:

  - You are about to drop the column `model` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RolePermission` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `roleId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."RolePermission" DROP CONSTRAINT "RolePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RolePermission" DROP CONSTRAINT "RolePermission_roleId_fkey";

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "roleId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Vehicle" DROP COLUMN "model";

-- DropTable
DROP TABLE "public"."Permission";

-- DropTable
DROP TABLE "public"."RolePermission";
