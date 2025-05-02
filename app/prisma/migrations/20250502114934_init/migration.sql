-- CreateTable
CREATE TABLE "CaptionedImage" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "animal" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "adminApproved" BOOLEAN NOT NULL DEFAULT false,
    "flaggedAbusive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaptionedImage_pkey" PRIMARY KEY ("id")
);
