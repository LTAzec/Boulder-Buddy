-- CreateEnum
CREATE TYPE "BoulderColor" AS ENUM ('White', 'Green', 'Blue', 'Red', 'Yellow', 'Purple', 'Black', 'Orange');

-- CreateEnum
CREATE TYPE "BoulderGrade" AS ENUM ('FB_4', 'FB_5A', 'FB_5B', 'FB_5C', 'FB_6A', 'FB_6B', 'FB_6C', 'FB_7A', 'FB_7B', 'FB_7C');

-- CreateEnum
CREATE TYPE "LogStatus" AS ENUM ('PROJECT', 'SENT', 'FLASH');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'Setter';
ALTER TYPE "Role" ADD VALUE 'Admin';

-- CreateTable
CREATE TABLE "Gym" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gym_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wall" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "gymId" UUID NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sector" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "wallId" UUID NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Boulder" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "color" "BoulderColor" NOT NULL,
    "grade" "BoulderGrade" NOT NULL,
    "sectorId" UUID NOT NULL,
    "setByUserId" UUID,
    "setDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "posX" INTEGER NOT NULL,
    "posY" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Boulder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoulderTag" (
    "boulderId" UUID NOT NULL,
    "tagId" UUID NOT NULL,

    CONSTRAINT "BoulderTag_pkey" PRIMARY KEY ("boulderId","tagId")
);

-- CreateTable
CREATE TABLE "BoulderLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "boulderId" UUID NOT NULL,
    "status" "LogStatus" NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "note" TEXT,
    "customName" TEXT,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoulderLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoulderLike" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "boulderId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoulderLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "boulderId" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BoulderLike_userId_boulderId_key" ON "BoulderLike"("userId", "boulderId");

-- AddForeignKey
ALTER TABLE "Wall" ADD CONSTRAINT "Wall_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sector" ADD CONSTRAINT "Sector_wallId_fkey" FOREIGN KEY ("wallId") REFERENCES "Wall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boulder" ADD CONSTRAINT "Boulder_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boulder" ADD CONSTRAINT "Boulder_setByUserId_fkey" FOREIGN KEY ("setByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoulderTag" ADD CONSTRAINT "BoulderTag_boulderId_fkey" FOREIGN KEY ("boulderId") REFERENCES "Boulder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoulderTag" ADD CONSTRAINT "BoulderTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoulderLog" ADD CONSTRAINT "BoulderLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoulderLog" ADD CONSTRAINT "BoulderLog_boulderId_fkey" FOREIGN KEY ("boulderId") REFERENCES "Boulder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoulderLike" ADD CONSTRAINT "BoulderLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoulderLike" ADD CONSTRAINT "BoulderLike_boulderId_fkey" FOREIGN KEY ("boulderId") REFERENCES "Boulder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_boulderId_fkey" FOREIGN KEY ("boulderId") REFERENCES "Boulder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
