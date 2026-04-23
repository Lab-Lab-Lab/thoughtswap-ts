-- AlterTable
ALTER TABLE "_StudentEnrollment" ADD CONSTRAINT "_StudentEnrollment_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_StudentEnrollment_AB_unique";

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "semester" TEXT DEFAULT 'Unknown';

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
