-- AlterTable: Drop role column from users
ALTER TABLE "users" DROP COLUMN "role";

-- AlterTable: Add canvasId to courses
ALTER TABLE "courses" ADD COLUMN "canvasId" TEXT;

-- CreateTable: _StudentEnrollment (junction table for many-to-many relationship)
CREATE TABLE "_StudentEnrollment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_StudentEnrollment_A_fkey" FOREIGN KEY ("A") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_StudentEnrollment_B_fkey" FOREIGN KEY ("B") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: _TeacherEnrollment (relation from User to Course)
-- This is handled by the existing teacherId in courses, no separate table needed
-- The teacher relationship is one-to-many (one teacher per course, but a teacher can have many courses)

-- CreateIndex: Unique constraint on canvasId
CREATE UNIQUE INDEX "courses_canvasId_key" ON "courses"("canvasId");

-- CreateIndex: Unique constraint on _StudentEnrollment
CREATE UNIQUE INDEX "_StudentEnrollment_AB_unique" ON "_StudentEnrollment"("A", "B");
CREATE INDEX "_StudentEnrollment_B_index" ON "_StudentEnrollment"("B");
