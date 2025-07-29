-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "discountFormula" TEXT;

-- CreateTable
CREATE TABLE "CatalogOutboxEvent" (
    "id" SERIAL NOT NULL,
    "eventType" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "topic" TEXT NOT NULL,
    "key" TEXT NOT NULL,

    CONSTRAINT "CatalogOutboxEvent_pkey" PRIMARY KEY ("id")
);
