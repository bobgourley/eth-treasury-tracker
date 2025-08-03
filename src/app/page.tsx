import EcosystemSummary from '@/components/EcosystemSummary'
import EtfSummaryBlock from '@/components/EtfSummaryBlock'
import TreasuryCompaniesSummaryBlock from '@/components/TreasuryCompaniesSummaryBlock'
import NewsSummaryBlock from '@/components/NewsSummaryBlock'
import Navigation from '@/components/Navigation'
import Link from 'next/link'

export async function generateMetadata() {
  return {
    title: 'EthereumList.com - Comprehensive Ethereum Ecosystem Tracker',
    description: 'Track Ethereum ETFs, treasury companies, ecosystem statistics, and news. Comprehensive data on corporate ETH holdings, market metrics, and institutional adoption.',
    keywords: ['ethereum', 'ETF', 'treasury companies', 'corporate ETH holdings', 'institutional crypto', 'ethereum ecosystem'],
    openGraph: {
      title: 'EthereumList.com - Ethereum Ecosystem Tracker',
      description: 'Comprehensive tracking of Ethereum ETFs, treasury companies, and ecosystem data',
      type: 'website',
    },
  }
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation title="Ethereum List" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ecosystem Overview */}
        <EcosystemSummary />

        {/* Content Blocks Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* ETFs Block */}
          <EtfSummaryBlock />
          
          {/* Treasury Companies Block */}
          <TreasuryCompaniesSummaryBlock />
        </div>

        {/* News Block - Full Width */}
        <div className="mb-8">
          <NewsSummaryBlock />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2025 Ethereum List. Comprehensive Ethereum ecosystem tracking.</p>
            <p className="mt-2">
              Data sourced from public APIs, CoinGecko, EtherScan, Alpha Vantage, Financial Modeling Prep, and NewsAPI.
            </p>
            <p className="mt-2">
              Built with Next.js, Tailwind CSS, and Prisma.
            </p>
            <p className="mt-2">
              <Link href="/sitemap.xml" className="text-blue-600 hover:text-blue-700">Sitemap</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
