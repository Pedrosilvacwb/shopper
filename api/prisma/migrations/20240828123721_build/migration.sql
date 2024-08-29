-- CreateEnum
CREATE TYPE "MeasureType" AS ENUM ('WATER', 'GAS');

-- CreateTable
CREATE TABLE "measure" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "measuredAt" TIMESTAMP(3),
    "value" DOUBLE PRECISION NOT NULL,
    "measureType" "MeasureType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "customerCode" VARCHAR(255) NOT NULL,

    CONSTRAINT "measure_pkey" PRIMARY KEY ("id")
);
