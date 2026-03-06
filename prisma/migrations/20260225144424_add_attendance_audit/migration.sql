-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "attendanceMarkedById" TEXT,
ADD COLUMN     "attendedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_attendanceMarkedById_fkey" FOREIGN KEY ("attendanceMarkedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
