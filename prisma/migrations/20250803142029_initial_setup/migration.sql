-- CreateTable
CREATE TABLE "companies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "ticker" TEXT,
    "website" TEXT,
    "eth_holdings" REAL,
    "ethAddress" TEXT,
    "eth_addresses" TEXT,
    "market_cap" BIGINT,
    "shares_outstanding" BIGINT,
    "stock_price" REAL,
    "eth_per_share" REAL,
    "mnav_ratio" REAL,
    "staking_yield" REAL,
    "yield_sources" TEXT,
    "capital_structure" TEXT,
    "funding_sources" TEXT,
    "last_updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "system_metrics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "total_eth_holdings" REAL NOT NULL,
    "total_companies" INTEGER NOT NULL,
    "eth_price" REAL,
    "total_eth_value" REAL,
    "total_market_cap" REAL,
    "eth_supply_percent" REAL,
    "last_update" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_stock_update" DATETIME
);

-- CreateTable
CREATE TABLE "daily_snapshots" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "snapshot_date" DATETIME NOT NULL,
    "total_eth_holdings" REAL NOT NULL,
    "total_eth_value" REAL NOT NULL,
    "total_market_cap" REAL NOT NULL,
    "eth_price" REAL NOT NULL,
    "total_eth_supply" REAL,
    "eth_supply_percent" REAL,
    "company_count" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "etfs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "symbol" TEXT NOT NULL,
    "name" TEXT,
    "eth_holdings" REAL,
    "total_value" REAL,
    "assets_under_management" REAL,
    "expense_ratio" REAL,
    "net_asset_value" REAL,
    "last_updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "etf_metrics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "total_eth_held" REAL NOT NULL,
    "total_aum" REAL NOT NULL,
    "total_value" REAL NOT NULL,
    "etf_count" INTEGER NOT NULL,
    "avg_expense_ratio" REAL,
    "eth_price" REAL,
    "last_update" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "news_articles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "url_to_image" TEXT,
    "published_at" DATETIME NOT NULL,
    "source_name" TEXT NOT NULL,
    "company" TEXT,
    "ticker" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ecosystem_summaries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eth_price" REAL NOT NULL,
    "eth_supply" REAL NOT NULL,
    "total_tracked_eth" REAL NOT NULL,
    "total_tracked_percentage" REAL NOT NULL,
    "company_count" INTEGER NOT NULL,
    "company_total_eth" REAL NOT NULL,
    "company_total_value" REAL NOT NULL,
    "company_percentage" REAL NOT NULL,
    "etf_count" INTEGER NOT NULL,
    "etf_total_eth" REAL NOT NULL,
    "etf_total_value" REAL NOT NULL,
    "etf_percentage" REAL NOT NULL,
    "last_updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "email_verified" DATETIME,
    "image" TEXT,
    "is_admin" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "verificationtokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_ticker_key" ON "companies"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "daily_snapshots_snapshot_date_key" ON "daily_snapshots"("snapshot_date");

-- CreateIndex
CREATE UNIQUE INDEX "etfs_symbol_key" ON "etfs"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "news_articles_url_key" ON "news_articles"("url");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_token_key" ON "verificationtokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "verificationtokens"("identifier", "token");
