-- CreateTable
CREATE TABLE "ItineraryMilestone" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItineraryMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ItineraryMilestone_reservationId_idx" ON "ItineraryMilestone"("reservationId");

-- AddForeignKey
ALTER TABLE "ItineraryMilestone" ADD CONSTRAINT "ItineraryMilestone_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
