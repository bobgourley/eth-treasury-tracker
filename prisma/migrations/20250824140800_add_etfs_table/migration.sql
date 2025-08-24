-- CreateTable
CREATE TABLE "etfs" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT,
    "eth_holdings" DOUBLE PRECISION,
    "total_value" DOUBLE PRECISION,
    "assets_under_management" DOUBLE PRECISION,
    "expense_ratio" DOUBLE PRECISION,
    "inception_date" TIMESTAMP(3),
    "description" TEXT,
    "website" TEXT,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "etfs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "etfs_symbol_key" ON "etfs"("symbol");

-- CreateTable
CREATE TABLE "etf_metrics" (
    "id" SERIAL NOT NULL,
    "total_etfs" INTEGER NOT NULL DEFAULT 0,
    "total_eth_holdings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_aum" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "average_expense_ratio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etf_metrics_pkey" PRIMARY KEY ("id")
);
