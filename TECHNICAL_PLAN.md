# Ethereum Treasury Tracker - Technical Implementation Plan

## Technology Stack

### Hosting & Infrastructure
- **Frontend**: Vercel (Free tier - 100GB bandwidth, unlimited static sites)
- **Backend**: Vercel Serverless Functions (Free tier - 100GB-hours compute)
- **Database**: PlanetScale (Free tier - 5GB storage, 1B row reads/month)
- **Estimated Cost**: $0-5/month for MVP

### Development Stack
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database ORM**: Prisma
- **Authentication**: NextAuth.js (for admin)

### Data Sources (Free APIs)
- **Etherscan API**: ETH balance lookups (5 calls/sec free)
- **CoinGecko API**: Market data, ETH prices (50 calls/min free)
- **Alpha Vantage**: Stock market data for public companies (5 calls/min free)

## Development Phases

### Phase 1: Core Infrastructure (Week 1)
- [x] Set up Next.js project with TypeScript
- [x] Create database schema and seed with initial companies
- [x] Build basic API endpoints for data fetching
- [x] Implement simple admin authentication

### Phase 2: Data Pipeline (Week 2)
- [ ] Integrate Etherscan API for ETH holdings
- [ ] Add CoinGecko API for market data
- [ ] Create daily cron job for data updates
- [ ] Build data validation and conflict resolution

### Phase 3: Frontend & Polish (Week 3)
- [ ] Create modern, responsive UI
- [ ] Implement company list with sorting by ETH holdings
- [ ] Add admin dashboard for company management
- [ ] Deploy and test production environment

## Database Schema

### Companies Table
```sql
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  ticker VARCHAR(10),
  eth_holdings DECIMAL(18,8),
  eth_addresses TEXT[], -- JSON array of addresses
  market_cap BIGINT,
  shares_outstanding BIGINT,
  eth_per_share DECIMAL(18,8),
  mnav_ratio DECIMAL(5,2),
  staking_yield DECIMAL(5,2),
  yield_sources TEXT,
  capital_structure TEXT,
  funding_sources TEXT,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);
```

### System Metrics Table
```sql
CREATE TABLE system_metrics (
  id SERIAL PRIMARY KEY,
  total_eth_holdings DECIMAL(18,8),
  total_companies INTEGER,
  last_update TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Public APIs
- `GET /api/companies` - List all companies with metrics
- `GET /api/companies/[id]` - Get specific company details
- `GET /api/metrics` - Get aggregate statistics

### Admin APIs
- `POST /api/admin/companies` - Add new company
- `PUT /api/admin/companies/[id]` - Update company
- `DELETE /api/admin/companies/[id]` - Remove company
- `POST /api/admin/refresh` - Trigger data refresh

### Data Update APIs
- `POST /api/cron/update-data` - Daily data refresh endpoint

## File Structure
```
eth-treasury-tracker/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── companies/
│   │   │   ├── admin/
│   │   │   └── cron/
│   │   ├── admin/
│   │   └── page.tsx
│   ├── components/
│   │   ├── CompanyList.tsx
│   │   ├── CompanyCard.tsx
│   │   └── AdminDashboard.tsx
│   ├── lib/
│   │   ├── db.ts
│   │   ├── apis/
│   │   │   ├── etherscan.ts
│   │   │   ├── coingecko.ts
│   │   │   └── alphavantage.ts
│   │   └── utils.ts
│   └── types/
│       └── company.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── package.json
├── tailwind.config.js
├── next.config.js
└── vercel.json
```

## Sample Companies for MVP
1. **SharpLink Gaming** (SGLB)
2. **Bitmine Immersion** (BMNR)
3. **MicroStrategy** (MSTR) - for reference
4. **Tesla** (TSLA) - if still holding
5. **Coinbase** (COIN)
6. **Block** (SQ)
7. **Marathon Digital** (MARA)
8. **Riot Platforms** (RIOT)

## Deployment Strategy
1. **Development**: Local development with SQLite
2. **Staging**: Vercel preview deployments
3. **Production**: Vercel production + PlanetScale

## Security Considerations
- Environment variables for API keys
- Admin authentication required
- Rate limiting on public APIs
- Input validation and sanitization

## Performance Optimizations
- Static generation for company list
- API response caching
- Image optimization
- Lazy loading for large lists

---
*Last Updated: July 25, 2025*
