-- AlterEnum
-- Postgres requires the new enum value to be committed before it can be used
-- as a column default, so the default change lives in a separate migration.
ALTER TYPE "ReservationStatus" ADD VALUE 'pending';
