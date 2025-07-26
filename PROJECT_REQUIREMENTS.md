# Ethereum Treasury Companies Tracker - Project Requirements Document

## Project Overview

A web application that displays a comprehensive list of Ethereum treasury companies with key financial metrics, designed to provide transparency and insights into corporate Ethereum holdings.

## Target Audience

- **Primary (MVP)**: Curious individuals interested in corporate Ethereum adoption
- **Secondary (Future)**: Investors and researchers analyzing corporate crypto strategies

## Core Features

### MVP Features

#### Public Dashboard
- **Company List Display**: Modern, clean interface showing companies ordered by ETH holdings (descending)
- **Key Metrics Display**:
  - ETH Holdings (total amount)
  - ETH-per-Share (ETH concentration ratio)
  - mNAV (Market Value to Net Asset Value premium/discount)
  - Staking Yield and Yield Sources
  - Capital Structure overview
  - Funding Sources
- **Aggregate Statistics**: Total ETH held across all tracked companies
- **Responsive Design**: Mobile-friendly, modern CSS styling

#### Admin Backend
- **Company Management**: Admin interface to add/remove companies from tracking
- **Data Validation**: Review and approve data before public display
- **System Monitoring**: Basic health checks and data freshness indicators

### Technical Requirements

#### Data Management
- **Update Frequency**: Daily automated data refresh
- **Data Sources**: Free, reputable APIs only
  - Etherscan API for on-chain ETH holdings
  - CoinGecko/CoinMarketCap for market data
  - Public financial filings where available
- **Data Processing**: Fully automated - no manual data entry required
- **Data Accuracy**: Prioritize data consistency; implement basic conflict resolution

#### Architecture
- **Hosting**: Low-cost hosting solution (e.g., Vercel, Netlify for frontend + serverless functions)
- **Database**: Lightweight solution (SQLite, PostgreSQL on free tier, or serverless DB)
- **Backend**: Serverless functions or minimal server footprint
- **Frontend**: Modern web technologies (React/Vue/vanilla JS with modern CSS)

#### Performance & Reliability
- **Load Time**: Fast initial page load
- **Uptime**: Reliable daily data updates
- **Scalability**: Handle moderate traffic growth
- **Maintenance**: Minimal ongoing maintenance requirements

## Data Schema

### Company Entity
```
- Company Name
- Ticker Symbol (if public)
- ETH Holdings (amount)
- ETH Holdings Address(es) (for verification)
- Market Cap
- Shares Outstanding
- ETH per Share
- mNAV Ratio
- Staking Yield %
- Yield Sources (text description)
- Capital Structure (debt/equity summary)
- Funding Sources (text description)
- Last Updated timestamp
- Data Source references
```

### Aggregate Metrics
```
- Total ETH Holdings (all companies)
- Number of Companies Tracked
- Average ETH per Company
- Last System Update timestamp
```

## Example Companies to Track

- SharpLink Gaming
- Bitmine Immersion
- MicroStrategy (for reference/comparison)
- Tesla (if still holding)
- Other publicly known corporate ETH holders

## Success Criteria

### MVP Success Metrics
- [ ] Display accurate, current data for at least 10 companies
- [ ] Daily automated data updates working reliably
- [ ] Clean, professional UI that loads quickly
- [ ] Admin can easily add/remove companies
- [ ] Total hosting costs under $20/month

### Future Enhancement Opportunities
- Sorting and filtering capabilities
- Historical trend analysis
- Company detail pages
- Data export functionality
- Email alerts for significant changes
- API for third-party access

## Technical Constraints

- **Budget**: Minimal hosting and operational costs
- **Maintenance**: Low-maintenance, automated solution
- **Data Sources**: Free APIs and public data only
- **Scalability**: Must handle growth without significant infrastructure changes

## Risk Considerations

- **Data Availability**: Some companies may not disclose ETH holdings publicly
- **API Rate Limits**: Free APIs may have usage restrictions
- **Data Accuracy**: Conflicting data sources may require manual resolution
- **Regulatory Changes**: Corporate disclosure requirements may change

## Development Phases

### Phase 1 (MVP)
- Basic company list with core metrics
- Admin backend for company management
- Daily data refresh automation
- Modern, responsive UI

### Phase 2 (Future)
- Enhanced sorting and filtering
- Historical data tracking
- Advanced analytics and insights
- User engagement features

## Acceptance Criteria

The project will be considered complete when:
1. Public dashboard displays accurate data for tracked companies
2. Data updates automatically every 24 hours
3. Admin can manage company list through backend interface
4. Site loads quickly and displays properly on desktop and mobile
5. Total operational costs remain under budget constraints
6. System runs reliably with minimal manual intervention

---

*Document Version: 1.0*  
*Last Updated: July 25, 2025*  
*Status: Draft - Pending Approval*
