-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN "description" TEXT;
ALTER TABLE "Ingredient" ADD COLUMN "imagePath" TEXT;
ALTER TABLE "Ingredient" ADD COLUMN "productUrl" TEXT;

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "total" REAL,
    "date" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ocrText" TEXT,
    CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
