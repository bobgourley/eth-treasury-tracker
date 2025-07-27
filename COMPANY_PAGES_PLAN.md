# Individual Company Profile Pages - Implementation Plan

## 🎯 Goal
Create comprehensive individual profile pages for each company in our ETH treasury tracker, displaying all available data, calculated metrics, and external links. Update all company references across the site to link to these dedicated pages.

## 📋 Page Structure & Content

### URL Structure
- **Route**: `/companies/[ticker]` (e.g., `/companies/TSLA`, `/companies/MSTR`)
- **Dynamic routing** using Next.js app router
- **SEO-friendly** URLs with company ticker symbols

### Page Sections

#### 1. Company Header
- **Company name** and ticker symbol
- **Current stock price** and daily change
- **Market capitalization**
- **Company logo** (if available via API)
- **Industry/sector** classification

#### 2. ETH Holdings Overview
- **Total ETH holdings** (current amount)
- **ETH value in USD** (current market value)
- **ETH as % of market cap** (ECMC - ETH Component of Market Cap)
- **Last updated** timestamp
- **Holdings change** indicators (if historical data available)

#### 3. Financial Metrics
- **Stock price** (real-time via Alpha Vantage API)
- **Market cap** (calculated: shares outstanding × stock price)
- **52-week high/low**
- **Volume** (trading volume)
- **P/E ratio** (if available)
- **Beta** (stock volatility measure)

#### 4. ETH Analytics
- **Premium/Discount** to ETH value
- **Fair value calculation** based on ETH holdings
- **ETCD weight** (ETH Treasury Company Dominance)
- **Diversification score**
- **Risk metrics** and concentration analysis

#### 5. Company Summary
- **Business description** (from Alpha Vantage or manual data)
- **Headquarters** location
- **Founded** year
- **Employee count** (if available)
- **Website** link
- **Key executives** (CEO, CFO if available)

#### 6. External Links & Resources
- **Yahoo Finance** direct link
- **SEC filings** link (EDGAR database)
- **Company website**
- **Investor relations** page
- **Recent news** links (if available)

#### 7. Charts & Visualizations
- **Stock price chart** (mini chart showing recent performance)
- **ETH holdings over time** (when historical data is available)
- **Premium/discount trend** (visual representation)

## 🛠️ Technical Implementation

### 1. Database Schema Updates
```sql
-- No new tables needed, use existing companies table
-- Potentially add fields for:
ALTER TABLE companies ADD COLUMN description TEXT;
ALTER TABLE companies ADD COLUMN website VARCHAR(255);
ALTER TABLE companies ADD COLUMN headquarters VARCHAR(255);
ALTER TABLE companies ADD COLUMN founded_year INTEGER;
ALTER TABLE companies ADD COLUMN sector VARCHAR(100);
```

### 2. API Integrations

#### Existing APIs (Already Available)
- **Alpha Vantage**: Stock prices, financial metrics, company overview
- **CoinGecko**: ETH price for value calculations
- **Our existing APIs**: Company data, premium/discount, exposure metrics

#### New API Endpoints Needed
```typescript
// GET /api/companies/[ticker]
// Returns comprehensive company data
interface CompanyProfile {
  // Basic info
  id: number
  name: string
  ticker: string
  description?: string
  website?: string
  headquarters?: string
  sector?: string
  
  // Financial data
  stockPrice: number
  marketCap: string
  priceChange: number
  priceChangePercent: number
  volume: number
  high52Week?: number
  low52Week?: number
  peRatio?: number
  beta?: number
  
  // ETH data
  ethHoldings: number
  ethValue: number
  ethPrice: number
  ecmcPercentage: number
  etcdWeight: number
  
  // Analytics
  premiumDiscount: number
  fairValue: number
  diversificationScore: number
  
  // External links
  yahooFinanceUrl: string
  secFilingsUrl: string
  
  lastUpdated: string
}
```

### 3. Page Components

#### CompanyHeader.tsx
- Company name, ticker, logo
- Stock price with real-time updates
- Market cap display

#### ETHHoldingsCard.tsx
- ETH amount and USD value
- Percentage of market cap
- Visual indicators

#### FinancialMetrics.tsx
- Key financial ratios and metrics
- 52-week range visualization
- Trading volume

#### AnalyticsSection.tsx
- Premium/discount calculation
- ECMC and ETCD metrics
- Risk analysis

#### ExternalLinks.tsx
- Yahoo Finance, SEC, company website
- Formatted link buttons

### 4. Routing Implementation
```typescript
// src/app/companies/[ticker]/page.tsx
export default function CompanyPage({ params }: { params: { ticker: string } }) {
  // Fetch company data by ticker
  // Render comprehensive company profile
}

// Generate static params for all companies
export async function generateStaticParams() {
  // Return array of { ticker: string } for all companies
}
```

## 🔗 Site-Wide Linking Updates

### Pages to Update
1. **Main Dashboard** (`/`)
   - Company names in table → link to `/companies/[ticker]`
   - Maintain sortable table functionality

2. **Premium/Discount Analytics** (`/analytics/premium-discount`)
   - Company names in table → link to company pages
   - Preserve analytics table sorting

3. **ETH Exposure Analytics** (`/analytics/exposure`)
   - Company names in table → link to company pages
   - Keep exposure metrics table functional

4. **Charts Page** (`/analytics/charts`)
   - Chart tooltips → clickable company names
   - Legend items → link to company pages

5. **Future pages** (any new analytics or charts)
   - Consistent linking pattern across all pages

### Implementation Strategy
```typescript
// Reusable component for company links
const CompanyLink = ({ ticker, name, className }: {
  ticker: string
  name: string
  className?: string
}) => (
  <Link 
    href={`/companies/${ticker}`}
    className={`hover:text-blue-600 transition-colors ${className}`}
  >
    {name}
  </Link>
)
```

## 📊 Data Sources & APIs

### Primary Data Sources
1. **Existing Database**: Company basic info, ETH holdings
2. **Alpha Vantage API**: Stock prices, financial metrics, company overview
3. **CoinGecko API**: ETH price for calculations
4. **Our Analytics APIs**: Premium/discount, exposure metrics

### Enhanced Data (Future)
1. **Yahoo Finance API**: Additional financial metrics
2. **SEC EDGAR API**: Recent filings and documents
3. **News APIs**: Company-specific news and updates
4. **Social APIs**: Sentiment analysis (Twitter, Reddit)

## 🎨 Design & UX

### Layout Structure
- **Responsive design** for mobile, tablet, desktop
- **Clean, professional** appearance matching site theme
- **Fast loading** with optimized images and data
- **SEO optimized** with proper meta tags and structured data

### Visual Elements
- **Consistent color scheme** with existing site
- **Interactive charts** where applicable
- **Clear data hierarchy** with proper typography
- **Loading states** for real-time data
- **Error handling** for missing or failed data

### Navigation
- **Breadcrumb navigation**: Home > Companies > [Company Name]
- **Back to dashboard** link
- **Related companies** suggestions
- **Cross-links** to relevant analytics pages

## 🚀 Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- [ ] Create dynamic routing `/companies/[ticker]`
- [ ] Build basic company page layout
- [ ] Implement company data API endpoint
- [ ] Create core page components

### Phase 2: Data Integration (Week 1-2)
- [ ] Integrate Alpha Vantage company overview API
- [ ] Add financial metrics calculations
- [ ] Implement ETH analytics integration
- [ ] Add external link generation

### Phase 3: Site-Wide Linking (Week 2)
- [ ] Update main dashboard company links
- [ ] Update all analytics page company references
- [ ] Update charts page company interactions
- [ ] Create reusable CompanyLink component

### Phase 4: Enhancement & Polish (Week 2-3)
- [ ] Add mini charts and visualizations
- [ ] Implement SEO optimization
- [ ] Add loading states and error handling
- [ ] Performance optimization and testing

## 📈 Success Metrics

### User Engagement
- **Page views** on individual company pages
- **Time spent** on company pages
- **Click-through rates** from main dashboard to company pages
- **Bounce rate** on company pages

### Technical Performance
- **Page load times** (target: <2 seconds)
- **API response times** for company data
- **SEO rankings** for company-specific searches
- **Mobile responsiveness** scores

### Business Value
- **User retention** improvement
- **Session duration** increase
- **Return visitor** percentage
- **Feature adoption** across analytics pages

## 🔒 Security & Performance

### Data Security
- **API rate limiting** for external services
- **Input validation** for ticker parameters
- **Error handling** for invalid company requests
- **HTTPS enforcement** for all external links

### Performance Optimization
- **Static generation** for company pages where possible
- **Image optimization** for company logos
- **API response caching** for financial data
- **Lazy loading** for non-critical components

## 💰 Cost Considerations

### API Usage
- **Alpha Vantage**: Free tier allows 25 requests/day, paid tiers for higher volume
- **CoinGecko**: Current free usage should be sufficient
- **Additional APIs**: Budget for enhanced data sources if needed

### Development Time
- **Estimated effort**: 2-3 weeks for full implementation
- **Priority features**: Core company pages first, enhancements second
- **Iterative approach**: Ship basic version, then enhance

---

## 📋 Approval Checklist

Please review and approve:

- [ ] **URL structure**: `/companies/[ticker]` format
- [ ] **Page content sections**: Header, ETH holdings, financial metrics, analytics, summary, external links
- [ ] **Data sources**: Alpha Vantage, existing APIs, calculated metrics
- [ ] **Site-wide linking**: Update all company references to link to new pages
- [ ] **Implementation phases**: 2-3 week timeline with iterative approach
- [ ] **Technical approach**: Next.js dynamic routing, reusable components, API integration

**Ready to proceed with implementation once approved!** 🚀
