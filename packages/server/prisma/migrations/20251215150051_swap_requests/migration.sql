-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "maxSwapRequests" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "swap_requests" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "swap_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "swap_requests" ADD CONSTRAINT "swap_requests_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swap_requests" ADD CONSTRAINT "swap_requests_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
