-- CreateIndex
CREATE INDEX "companies_is_active_idx" ON "companies"("is_active");

-- CreateIndex
CREATE INDEX "companies_eth_holdings_idx" ON "companies"("eth_holdings");

-- CreateIndex
CREATE INDEX "companies_is_active_eth_holdings_idx" ON "companies"("is_active", "eth_holdings");

-- CreateIndex
CREATE INDEX "etfs_is_active_idx" ON "etfs"("is_active");

-- CreateIndex
CREATE INDEX "etfs_assets_under_management_idx" ON "etfs"("assets_under_management");

-- CreateIndex
CREATE INDEX "etfs_is_active_assets_under_management_idx" ON "etfs"("is_active", "assets_under_management");

-- CreateIndex
CREATE INDEX "news_articles_published_at_idx" ON "news_articles"("published_at");

-- CreateIndex
CREATE INDEX "news_articles_company_idx" ON "news_articles"("company");
