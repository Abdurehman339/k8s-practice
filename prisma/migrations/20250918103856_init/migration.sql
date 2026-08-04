/*
  Warnings:

  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."EUserRole" AS ENUM ('Admin', 'User');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."EUserRole" NOT NULL;
