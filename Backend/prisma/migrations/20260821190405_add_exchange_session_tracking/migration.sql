-- AlterTable
ALTER TABLE "Exchange" ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "sessionEndedAt" TIMESTAMP(3),
ADD COLUMN     "sessionStartedAt" TIMESTAMP(3);
