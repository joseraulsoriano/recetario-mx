/*
  Warnings:

  - A unique constraint covering the columns `[name,address]` on the table `Store` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Store_name_address_key" ON "Store"("name", "address");
