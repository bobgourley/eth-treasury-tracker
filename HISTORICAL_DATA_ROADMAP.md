# Historical ETH Holdings Data - Implementation Roadmap

## 🎯 Goal
Create historical charts showing ETH Treasury Company holdings over time to track how companies have built their ETH positions.

## 📊 Data Sources & Implementation Options

### Option A: SEC Filing Integration (Automated)
**Data Source**: SEC EDGAR API for 10-Q/10-K filings
- **Pros**: Official, quarterly data, legally required disclosures
- **Cons**: Quarterly frequency only, parsing complexity
- **Implementation**: 
  - SEC EDGAR API integration
  - Natural language processing for crypto mentions
  - Quarterly data points extraction

### Option B: Blockchain Analysis (Most Accurate)
**Data Source**: On-chain wallet tracking via Etherscan/Dune Analytics
- **Pros**: Real-time accuracy, daily/hourly granularity
- **Cons**: Requires identifying company wallet addresses
- **Implementation**:
  - Research known company wallet addresses
  - Etherscan API historical balance queries
  - Wallet clustering analysis for comprehensive tracking

### Option C: Manual Data Collection (Immediate)
**Data Source**: Manual research of press releases, earnings calls, filings
- **Pros**: Can start immediately, high accuracy for key events
- **Cons**: Labor intensive, not scalable
- **Implementation**:
  - Database table for historical holdings
  - Admin interface for data entry
  - Manual research of major ETH purchases/sales

### Option D: News/Announcement Parsing (Semi-Automated)
**Data Source**: Company press releases, earnings transcripts, social media
- **Pros**: Captures major events and announcements
- **Cons**: Inconsistent format, requires NLP
- **Implementation**:
  - Web scraping of company investor relations pages
  - Twitter/X API for company announcements
  - NLP parsing for ETH purchase/sale mentions

### Option E: Financial Data Provider APIs (Paid)
**Data Source**: CoinGecko Pro, Messari, CryptoCompare institutional data
- **Pros**: Professional data quality, API access
- **Cons**: Subscription costs, limited historical depth
- **Implementation**:
  - Evaluate paid API tiers
  - Integration with institutional data endpoints
  - Cost-benefit analysis

## 🚀 Recommended Implementation Phases

### Phase 1: Foundation (Current)
- Build chart infrastructure with mock/sample data
- Create database schema for historical holdings
- Implement time-series chart component

### Phase 2: SEC Integration (Automated)
- SEC EDGAR API integration
- Filing parser for crypto holdings
- Quarterly data point extraction

### Phase 3: Blockchain Analysis (Most Accurate)
- Company wallet address research
- Etherscan historical balance tracking
- Daily/hourly granularity data

### Phase 4: News Integration (Event-Driven)
- Press release monitoring
- Major purchase/sale event detection
- Chart annotations for significant events

## 📈 Chart Features to Implement

### Core Functionality
- Time-series line chart for each company
- Multiple companies on same chart
- ETH price overlay for context
- Zoom/pan functionality
- Date range selection

### Advanced Features
- Event annotations (major purchases/sales)
- Percentage change calculations
- Market share evolution over time
- Export functionality (PNG, PDF, CSV)
- Real-time updates

### Interactive Elements
- Company toggle on/off
- Hover tooltips with details
- Click-through to company details
- Share chart functionality

## 🛠️ Technical Stack
- **Charts**: Chart.js or Recharts for React
- **Data Storage**: PostgreSQL time-series tables
- **APIs**: SEC EDGAR, Etherscan, company APIs
- **Processing**: Node.js background jobs for data collection
- **Caching**: Redis for performance optimization

## 📅 Timeline Estimates
- **Phase 1 (Foundation)**: 1-2 weeks
- **Phase 2 (SEC Integration)**: 2-3 weeks
- **Phase 3 (Blockchain Analysis)**: 3-4 weeks
- **Phase 4 (News Integration)**: 2-3 weeks

## 💰 Cost Considerations
- **Free Options**: SEC EDGAR API, Etherscan API (rate limited)
- **Paid Options**: CoinGecko Pro (~$500/month), Messari (~$1000/month)
- **Development Time**: Significant engineering effort for automation

## 🎯 Success Metrics
- Historical data coverage (% of companies with historical data)
- Data accuracy (comparison with known public disclosures)
- Chart engagement (user interactions, time spent)
- Data freshness (how current the historical data is)

---

*This roadmap will be updated as we learn more about data availability and implementation challenges.*
