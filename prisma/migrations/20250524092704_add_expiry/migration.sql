-- CreateTable
CREATE TABLE "ShortUrl" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "ShortUrl_slug_key" ON "ShortUrl"("slug");
