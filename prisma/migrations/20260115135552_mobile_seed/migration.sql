-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BoulderGrade" ADD VALUE 'FB_5A_plus';
ALTER TYPE "BoulderGrade" ADD VALUE 'FB_5B_plus';
ALTER TYPE "BoulderGrade" ADD VALUE 'FB_5C_plus';
ALTER TYPE "BoulderGrade" ADD VALUE 'FB_5_plus';
ALTER TYPE "BoulderGrade" ADD VALUE 'FB_6A_plus';
ALTER TYPE "BoulderGrade" ADD VALUE 'FB_6B_plus';
ALTER TYPE "BoulderGrade" ADD VALUE 'FB_6C_plus';
ALTER TYPE "BoulderGrade" ADD VALUE 'FB_7A_plus';
ALTER TYPE "BoulderGrade" ADD VALUE 'FB_7B_plus';
ALTER TYPE "BoulderGrade" ADD VALUE 'FB_7C_plus';
ALTER TYPE "BoulderGrade" ADD VALUE 'FB_8A';
ALTER TYPE "BoulderGrade" ADD VALUE 'FB_8A_plus';
ALTER TYPE "BoulderGrade" ADD VALUE 'FB_8B';
ALTER TYPE "BoulderGrade" ADD VALUE 'FB_8B_plus';
ALTER TYPE "BoulderGrade" ADD VALUE 'FB_8C';
ALTER TYPE "BoulderGrade" ADD VALUE 'FB_8C_plus';
