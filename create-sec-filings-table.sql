-- Create SEC Filings table for Ethereum Treasury Tracker
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE "sec_filings" (
    "id" SERIAL PRIMARY KEY,
    "accession_number" TEXT NOT NULL UNIQUE,
    "company_name" TEXT NOT NULL,
    "cik" TEXT NOT NULL,
    "form_type" TEXT NOT NULL,
    "filing_date" TIMESTAMP(3) NOT NULL,
    "report_title" TEXT,
    "edgar_url" TEXT NOT NULL,
    "full_text_url" TEXT,
    "local_content_path" TEXT,
    "content_cached" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX "sec_filings_filing_date_idx" ON "sec_filings"("filing_date");
CREATE INDEX "sec_filings_company_name_idx" ON "sec_filings"("company_name");
CREATE INDEX "sec_filings_form_type_idx" ON "sec_filings"("form_type");
CREATE INDEX "sec_filings_is_active_idx" ON "sec_filings"("is_active");
CREATE INDEX "sec_filings_is_active_filing_date_idx" ON "sec_filings"("is_active", "filing_date");

-- Verify table creation
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sec_filings' 
ORDER BY ordinal_position;
