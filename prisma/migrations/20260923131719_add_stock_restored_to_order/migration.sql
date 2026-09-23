-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "stockRestored" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "variantId" TEXT;
