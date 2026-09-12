-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryDate" TIMESTAMP(3),
ADD COLUMN     "deliveryNote" TEXT,
ADD COLUMN     "deliverySlot" TEXT,
ADD COLUMN     "installService" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "recipientName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "recipientPhone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shippingAddress" TEXT NOT NULL DEFAULT '';
