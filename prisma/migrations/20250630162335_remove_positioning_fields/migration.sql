/*
  Warnings:

  - You are about to drop the column `height` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `x` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `notes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notes" DROP COLUMN "height",
DROP COLUMN "width",
DROP COLUMN "x",
DROP COLUMN "y";
