-- AlterTable
ALTER TABLE "User" ADD COLUMN     "contentPreferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "newsletterSubscribed" BOOLEAN NOT NULL DEFAULT true;
