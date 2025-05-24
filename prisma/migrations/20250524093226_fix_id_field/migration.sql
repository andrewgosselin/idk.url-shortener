/*
  Warnings:

  - The primary key for the `ShortUrl` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `ShortUrl` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ShortUrl" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" DATETIME
);
INSERT INTO "new_ShortUrl" ("clicks", "createdAt", "expiresAt", "id", "slug", "url") SELECT "clicks", "createdAt", "expiresAt", "id", "slug", "url" FROM "ShortUrl";
DROP TABLE "ShortUrl";
ALTER TABLE "new_ShortUrl" RENAME TO "ShortUrl";
CREATE UNIQUE INDEX "ShortUrl_slug_key" ON "ShortUrl"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
