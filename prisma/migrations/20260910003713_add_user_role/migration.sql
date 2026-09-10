-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('guest', 'qa');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'guest';
