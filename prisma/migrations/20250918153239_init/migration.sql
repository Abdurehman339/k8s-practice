-- CreateEnum
CREATE TYPE "public"."TestimonialCategory" AS ENUM ('Portfolio', 'Service', 'Organization', 'Other');

-- CreateEnum
CREATE TYPE "public"."ENotificationType" AS ENUM ('portfolio_created');

-- CreateEnum
CREATE TYPE "public"."ENotificationStatus" AS ENUM ('Read', 'Unread');

-- CreateTable
CREATE TABLE "public"."Portfolio" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "service_type" TEXT NOT NULL,
    "industry_type" TEXT NOT NULL,
    "country" TEXT,
    "duration_in_months" INTEGER,
    "thumbnail_image_id" UUID,
    "icon_image_id" UUID,
    "cover_image_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Mission" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "portfolio_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Services" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "Services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Technologies" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "image_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "Technologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Testimonial" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "rating" INTEGER,
    "category" "public"."TestimonialCategory" DEFAULT 'Organization',
    "portfolio_id" UUID,
    "user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "info" JSONB,
    "type" "public"."ENotificationType" NOT NULL,
    "status" "public"."ENotificationStatus" NOT NULL DEFAULT 'Unread',
    "receiver_id" UUID,
    "sender_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_MissionToServices" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_MissionToServices_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_MissionToTechnologies" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_MissionToTechnologies_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_thumbnail_image_id_key" ON "public"."Portfolio"("thumbnail_image_id");

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_icon_image_id_key" ON "public"."Portfolio"("icon_image_id");

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_cover_image_id_key" ON "public"."Portfolio"("cover_image_id");

-- CreateIndex
CREATE INDEX "Portfolio_name_idx" ON "public"."Portfolio"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Mission_portfolio_id_key" ON "public"."Mission"("portfolio_id");

-- CreateIndex
CREATE UNIQUE INDEX "Technologies_image_id_key" ON "public"."Technologies"("image_id");

-- CreateIndex
CREATE INDEX "Testimonial_portfolio_id_idx" ON "public"."Testimonial"("portfolio_id");

-- CreateIndex
CREATE INDEX "_MissionToServices_B_index" ON "public"."_MissionToServices"("B");

-- CreateIndex
CREATE INDEX "_MissionToTechnologies_B_index" ON "public"."_MissionToTechnologies"("B");

-- AddForeignKey
ALTER TABLE "public"."Portfolio" ADD CONSTRAINT "Portfolio_thumbnail_image_id_fkey" FOREIGN KEY ("thumbnail_image_id") REFERENCES "public"."Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Portfolio" ADD CONSTRAINT "Portfolio_icon_image_id_fkey" FOREIGN KEY ("icon_image_id") REFERENCES "public"."Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Portfolio" ADD CONSTRAINT "Portfolio_cover_image_id_fkey" FOREIGN KEY ("cover_image_id") REFERENCES "public"."Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mission" ADD CONSTRAINT "Mission_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."Portfolio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Technologies" ADD CONSTRAINT "Technologies_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "public"."Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Testimonial" ADD CONSTRAINT "Testimonial_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."Portfolio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Testimonial" ADD CONSTRAINT "Testimonial_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_MissionToServices" ADD CONSTRAINT "_MissionToServices_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_MissionToServices" ADD CONSTRAINT "_MissionToServices_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_MissionToTechnologies" ADD CONSTRAINT "_MissionToTechnologies_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_MissionToTechnologies" ADD CONSTRAINT "_MissionToTechnologies_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Technologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
