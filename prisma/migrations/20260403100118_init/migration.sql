/*
  Warnings:

  - You are about to drop the column `auth_flow` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `is_online` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `last_active_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_customer_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Mission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Portfolio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Services` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Technologies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Testimonial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MissionToServices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MissionToTechnologies` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "public"."EUserRole" ADD VALUE 'Vendor';

-- DropForeignKey
ALTER TABLE "public"."Mission" DROP CONSTRAINT "Mission_portfolio_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Portfolio" DROP CONSTRAINT "Portfolio_cover_image_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Portfolio" DROP CONSTRAINT "Portfolio_icon_image_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Portfolio" DROP CONSTRAINT "Portfolio_thumbnail_image_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Technologies" DROP CONSTRAINT "Technologies_image_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Testimonial" DROP CONSTRAINT "Testimonial_portfolio_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Testimonial" DROP CONSTRAINT "Testimonial_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."_MissionToServices" DROP CONSTRAINT "_MissionToServices_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_MissionToServices" DROP CONSTRAINT "_MissionToServices_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_MissionToTechnologies" DROP CONSTRAINT "_MissionToTechnologies_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_MissionToTechnologies" DROP CONSTRAINT "_MissionToTechnologies_B_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "auth_flow",
DROP COLUMN "gender",
DROP COLUMN "is_online",
DROP COLUMN "last_active_at",
DROP COLUMN "status",
DROP COLUMN "stripe_customer_id",
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "public"."Mission";

-- DropTable
DROP TABLE "public"."Portfolio";

-- DropTable
DROP TABLE "public"."Services";

-- DropTable
DROP TABLE "public"."Technologies";

-- DropTable
DROP TABLE "public"."Testimonial";

-- DropTable
DROP TABLE "public"."_MissionToServices";

-- DropTable
DROP TABLE "public"."_MissionToTechnologies";

-- DropEnum
DROP TYPE "public"."Gender";

-- DropEnum
DROP TYPE "public"."TestimonialCategory";
