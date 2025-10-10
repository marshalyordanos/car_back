/*
  Warnings:

  - Made the column `isStaff` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "isStaff" SET NOT NULL;
