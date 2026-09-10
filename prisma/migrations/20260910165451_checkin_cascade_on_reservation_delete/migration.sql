-- DropForeignKey
ALTER TABLE "CheckIn" DROP CONSTRAINT "CheckIn_reservationId_fkey";

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
