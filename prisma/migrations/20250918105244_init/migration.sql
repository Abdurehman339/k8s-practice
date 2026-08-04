-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('Male', 'Female', 'Other');

-- CreateEnum
CREATE TYPE "public"."EAuthFlow" AS ENUM ('Apple', 'Google', 'Manual');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "auth_flow" "public"."EAuthFlow" NOT NULL DEFAULT 'Manual',
ADD COLUMN     "email_verified" BOOLEAN DEFAULT false,
ADD COLUMN     "gender" "public"."Gender",
ADD COLUMN     "is_online" BOOLEAN DEFAULT false,
ADD COLUMN     "last_active_at" TIMESTAMP(3),
ADD COLUMN     "location" JSONB,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "refresh_token" TEXT,
ADD COLUMN     "refresh_token_expiry" TIMESTAMP(3),
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripe_customer_id" TEXT;
