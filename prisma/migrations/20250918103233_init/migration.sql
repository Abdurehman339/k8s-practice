/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."EOTP" AS ENUM ('Forgot_Password', 'Verify');

-- CreateEnum
CREATE TYPE "public"."ESortDirection" AS ENUM ('asc', 'desc');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "password" TEXT NOT NULL;
