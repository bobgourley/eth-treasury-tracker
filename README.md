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
- **Enhanced Stats Banner**: ETH price, total ETH value, total market cap, % of ETH supply held
- **Company Rankings**: Ordered by ETH holdings with intuitive ranking system
- **Collapsible Cards**: Clean summary view with expandable detailed metrics
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 💰 Financial Metrics
- **ETH Holdings**: Total Ethereum held by each company
- **ETH Value**: USD value of ETH holdings (ETH × current price)
- **Market Cap**: Company's total market capitalization
- **ETH per Share**: ETH holdings divided by shares outstanding
- **mNAV Ratio**: Market cap to net asset value ratio
- **Staking Yield**: Annual staking rewards percentage

### 🔗 External Integration
- **Yahoo Finance Links**: Direct access to stock information
- **Real Company Data**: Tracks 6 major ETH treasury companies
- **Live Data Ready**: Architecture prepared for API integration

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

Currently tracking 6 major Ethereum treasury companies:

1. **BitMine Immersion Technologies** (BMNR) - 433,716.5 ETH
2. **SharpLink Gaming** (SBET) - 360,807 ETH
3. **Coinbase Global, Inc** (COIN) - 137,300 ETH
4. **Bit Digital, Inc** (BTBT) - 120,306 ETH
5. **BTCS Inc.** (BTCS) - 55,788 ETH
6. **GameSquare Holdings** (GAME) - 10,170 ETH

**Total Tracked**: 1,118,087.5 ETH (~$4.11B at $3,680/ETH)

## 🔧 API Endpoints

### GET `/api/companies`
Returns all active companies ordered by ETH holdings (descending)

### GET `/api/metrics`
Returns system-wide metrics including:
- Total ETH holdings across all companies
- Total USD value of ETH holdings
- Total market cap of all tracked companies
- Percentage of total ETH supply held
- Current ETH price
- Number of companies tracked

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

# API Keys (for future live data integration)
ETHERSCAN_API_KEY="your-etherscan-key"
COINGECKO_API_KEY="your-coingecko-key"
```

## 🛣️ Roadmap

### Phase 1: MVP ✅
- [x] Basic dashboard with company listings
- [x] Enhanced stats banner
- [x] Collapsible company cards
- [x] ETH value calculations
- [x] Yahoo Finance integration

### Phase 2: Live Data Integration 🚧
- [ ] Etherscan API integration
- [ ] CoinGecko API integration
- [ ] Automated daily data updates
- [ ] Real-time ETH price feeds

### Phase 3: Admin Backend
- [ ] Secure admin authentication
- [ ] Company management interface
- [ ] Data validation and monitoring
- [ ] Manual data override capabilities

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
