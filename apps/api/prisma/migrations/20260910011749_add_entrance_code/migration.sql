-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'admin';

-- CreateTable
CREATE TABLE "EntranceCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntranceCode_pkey" PRIMARY KEY ("id")
);
