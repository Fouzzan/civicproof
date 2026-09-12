-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CITIZEN', 'AUTHORITY');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('CREATED', 'READY_FOR_HANDOFF', 'HANDED_OFF', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "HandoffStatus" AS ENUM ('DRAFT', 'READY_FOR_OFFICIAL_HANDOFF', 'HANDED_OFF', 'CONFIRMED_SUBMISSION');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('CASE_CREATED', 'AI_ANALYSIS_COMPLETED', 'COMPLAINT_PREPARED', 'OFFICIAL_HANDOFF', 'AUTHORITY_REVIEW', 'STATUS_UPDATED', 'RESOLUTION_RECORDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CITIZEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "authorityUserId" TEXT,
    "incidentType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "incidentDateTime" TIMESTAMP(3),
    "location" TEXT,
    "isSensitive" BOOLEAN NOT NULL DEFAULT false,
    "status" "CaseStatus" NOT NULL DEFAULT 'CREATED',
    "handoffStatus" "HandoffStatus" NOT NULL DEFAULT 'DRAFT',
    "severity" "Severity",
    "severityReason" TEXT,
    "reportingDirection" TEXT,
    "reportingChannel" TEXT,
    "complaintDraft" TEXT,
    "resolutionText" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "storageReference" TEXT NOT NULL,
    "description" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIAnalysis" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "structuredData" JSONB,
    "severitySuggestion" "Severity",
    "reportingSuggestion" TEXT,
    "modelLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "eventType" "TimelineEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "actorUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Case_caseId_key" ON "Case"("caseId");

-- CreateIndex
CREATE INDEX "Case_reporterId_idx" ON "Case"("reporterId");

-- CreateIndex
CREATE INDEX "Case_authorityUserId_idx" ON "Case"("authorityUserId");

-- CreateIndex
CREATE INDEX "Evidence_caseId_idx" ON "Evidence"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "AIAnalysis_caseId_key" ON "AIAnalysis"("caseId");

-- CreateIndex
CREATE INDEX "TimelineEvent_caseId_createdAt_idx" ON "TimelineEvent"("caseId", "createdAt");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_authorityUserId_fkey" FOREIGN KEY ("authorityUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
