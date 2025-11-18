-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "joinCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptUse" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "PromptUse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thought" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "assignedTo" TEXT,
    "promptUseId" TEXT NOT NULL,

    CONSTRAINT "Thought_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_joinCode_key" ON "Course"("joinCode");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptUse" ADD CONSTRAINT "PromptUse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thought" ADD CONSTRAINT "Thought_promptUseId_fkey" FOREIGN KEY ("promptUseId") REFERENCES "PromptUse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
