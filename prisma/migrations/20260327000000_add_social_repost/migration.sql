-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('TWITTER', 'FACEBOOK', 'LINKEDIN', 'INSTAGRAM', 'TIKTOK');

-- CreateEnum
CREATE TYPE "SocialSourceStatus" AS ENUM ('PENDING', 'READY', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RepostStatus" AS ENUM ('DRAFT', 'APPROVED', 'POSTED', 'SKIPPED', 'FAILED');

-- CreateEnum
CREATE TYPE "RepostBatchStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "accountName" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialSource" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "content" TEXT,
    "contentType" TEXT,
    "platform" TEXT,
    "metadata" JSONB,
    "status" "SocialSourceStatus" NOT NULL DEFAULT 'PENDING',
    "capturedVia" TEXT,
    "batchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialRepost" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "generatedText" TEXT NOT NULL,
    "editedText" TEXT,
    "status" "RepostStatus" NOT NULL DEFAULT 'DRAFT',
    "platformPostId" TEXT,
    "errorMessage" TEXT,
    "accountId" TEXT,
    "batchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialRepost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepostBatch" (
    "id" TEXT NOT NULL,
    "batchSize" INTEGER NOT NULL DEFAULT 50,
    "contentType" TEXT,
    "status" "RepostBatchStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepostBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_platform_key" ON "SocialAccount"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "SocialSource_url_key" ON "SocialSource"("url");

-- CreateIndex
CREATE INDEX "SocialRepost_sourceId_idx" ON "SocialRepost"("sourceId");

-- CreateIndex
CREATE INDEX "SocialRepost_status_idx" ON "SocialRepost"("status");

-- AddForeignKey
ALTER TABLE "SocialSource" ADD CONSTRAINT "SocialSource_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "RepostBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialRepost" ADD CONSTRAINT "SocialRepost_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "SocialSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialRepost" ADD CONSTRAINT "SocialRepost_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "SocialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialRepost" ADD CONSTRAINT "SocialRepost_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "RepostBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
