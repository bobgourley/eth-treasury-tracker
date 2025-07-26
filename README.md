# Ethereum Treasury Tracker

A modern web application that tracks corporate Ethereum holdings and provides comprehensive financial metrics for companies with significant ETH treasuries.

![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=flat-square&logo=prisma)

## 🎯 Overview

The Ethereum Treasury Tracker provides transparency into corporate Ethereum holdings by displaying:

- **Real-time ETH holdings** for major public companies
- **Financial metrics** including market cap, ETH value, ETH per share, mNAV ratios
- **Staking information** and yield sources
- **Company details** with links to Yahoo Finance
- **Aggregate statistics** showing total ETH held across all tracked companies

## ✨ Features

### 📊 Comprehensive Dashboard
- **Enhanced Stats Banner**: Live ETH price, total ETH value, total market cap, % of ETH supply held
- **Company Rankings**: Ordered by ETH holdings with intuitive ranking system
- **Collapsible Cards**: Clean summary view with expandable detailed metrics
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 💰 Financial Metrics
- **ETH Holdings**: Total Ethereum held by each company
- **ETH Value**: USD value of ETH holdings (ETH × current price)
- **Live Stock Prices**: Real-time stock price data via Alpha Vantage API
- **Market Cap**: Company's total market capitalization
- **Shares Outstanding**: Current shares outstanding data
- **ETH per Share**: ETH holdings divided by shares outstanding
- **mNAV Ratio**: Market cap to net asset value ratio
- **Staking Yield**: Annual staking rewards percentage

### 🔗 External Integration
- **Yahoo Finance Links**: Direct access to stock information
- **Company Websites**: Official company website links
- **Live Data APIs**: CoinGecko (ETH price), Alpha Vantage (stock data), Etherscan (blockchain data)
- **Daily Rate Limiting**: Smart API usage with manual override capabilities

### 🔐 Admin Backend
- **Secure Authentication**: Password-protected admin interface
- **Company Management**: Full CRUD operations for company data
- **Manual Data Updates**: Override capabilities for ETH holdings and stock prices
- **Force Data Refresh**: Manual triggers for stock price and ETH data updates
- **Session Management**: Secure HTTP-only cookie sessions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/eth-treasury-tracker.git
   cd eth-treasury-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # Seed the database with sample data
   npx prisma db seed
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Tech Stack

### Frontend
- **Next.js 15.4.4** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Database toolkit and ORM
- **SQLite** - Development database (production-ready for PlanetScale/Supabase)

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 📁 Project Structure

```
eth-treasury-tracker/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Database seeding script
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── companies/    # Companies endpoint
│   │   │   └── metrics/      # System metrics endpoint
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Homepage
│   ├── components/
│   │   ├── CompanyCard.tsx   # Individual company card
│   │   └── CompanyList.tsx   # Main dashboard component
│   ├── lib/
│   │   ├── db.ts            # Database client
│   │   └── utils.ts         # Utility functions
│   └── types/
│       └── company.ts       # TypeScript interfaces
├── PROJECT_REQUIREMENTS.md   # Detailed project requirements
├── TECHNICAL_PLAN.md        # Technical implementation plan
└── README.md               # This file
```

## 📊 Tracked Companies

Currently tracking 9 major Ethereum treasury companies:

1. **BitMine Immersion Technologies** (BMNR) - 300,600 ETH - [bitminetech.io](https://bitminetech.io)
2. **SharpLink Gaming** (SBET) - 360,807 ETH - [sharplink.com](https://www.sharplink.com)
3. **Bit Digital, Inc** (BTBT) - 120,306 ETH - [bit-digital.com](https://bit-digital.com)
4. **BTCS Inc.** (BTCS) - 55,788 ETH - [btcs.com](https://www.btcs.com)
5. **GameSquare Holdings** (GAME) - 10,170 ETH - [gamesquare.com](https://www.gamesquare.com)
6. **Intchains Group Limited** (ICG) - 7,000 ETH - [intchains.com](https://www.intchains.com)
7. **KR1 plc** (KR1:AQSE) - 5,500 ETH - [kr1.io](https://kr1.io)
8. **Exodus Movement** (EXOD) - 2,500 ETH - [exodus.com](https://www.exodus.com)
9. **BTC Digital Ltd** (BTCT) - 2,100 ETH - [btct.investorroom.com](https://btct.investorroom.com)

**Total Tracked**: 864,771 ETH (~$3.18B at current ETH prices)

## 🔧 API Endpoints

### GET `/api/companies`
Returns all active companies ordered by ETH holdings (descending) with live stock prices and website links

### GET `/api/metrics`
Returns system-wide metrics including:
- Total ETH holdings across all companies
- Total USD value of ETH holdings
- Total market cap of all tracked companies
- Percentage of total ETH supply held
- Current ETH price
- Number of companies tracked

### POST `/api/update-data`
Triggers live data updates for ETH price, stock prices, and system metrics
- Supports `?forceStockUpdate=true` parameter for manual stock data refresh
- Implements daily rate limiting for stock API calls

### Admin Endpoints (Authentication Required)
- `GET/POST/PUT/DELETE /api/admin/companies` - Company management
- `POST /api/admin/login` - Admin authentication
- `POST /api/admin/logout` - Session termination

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables
4. Deploy automatically on push

### Environment Variables
```bash
# Database
DATABASE_URL="your-database-url"

# API Keys (for live data integration)
ETHERSCAN_API_KEY="your-etherscan-key"
COINGECKO_API_KEY="your-coingecko-key"
ALPHA_VANTAGE_API_KEY="your-alpha-vantage-key"

# Admin Authentication
ADMIN_PASSWORD_HASH="your-hashed-admin-password"
```

## 🛣️ Roadmap

### Phase 1: MVP ✅
- [x] Basic dashboard with company listings
- [x] Enhanced stats banner
- [x] Collapsible company cards
- [x] ETH value calculations
- [x] Yahoo Finance integration

### Phase 2: Live Data Integration ✅
- [x] Etherscan API integration
- [x] CoinGecko API integration
- [x] Alpha Vantage stock price integration
- [x] Automated daily data updates with rate limiting
- [x] Real-time ETH price feeds
- [x] Manual override capabilities

### Phase 3: Admin Backend ✅
- [x] Secure admin authentication
- [x] Company management interface
- [x] Data validation and monitoring
- [x] Manual data override capabilities
- [x] Website field management
- [x] Stock price manual updates

### Phase 4: Advanced Features
- [ ] Sorting and filtering options
- [ ] Search functionality
- [ ] Data export capabilities
- [ ] Email notifications

### Phase 5: Analytics
- [ ] Historical trend tracking
- [ ] Performance analytics
- [ ] Market correlation analysis
- [ ] Predictive insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Heroicons](https://heroicons.com/)
- Database powered by [Prisma](https://prisma.io/)
- Financial data sources: [Etherscan](https://etherscan.io/), [CoinGecko](https://coingecko.com/)

## 📞 Support

For questions, issues, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ for the Ethereum community**
