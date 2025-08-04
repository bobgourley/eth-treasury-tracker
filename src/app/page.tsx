import StaticEcosystemSummary from '@/components/StaticEcosystemSummary'
import StaticEtfSummaryBlock from '@/components/StaticEtfSummaryBlock'
import StaticTreasuryCompaniesSummaryBlock from '@/components/StaticTreasuryCompaniesSummaryBlock'
import StaticNewsSummaryBlock from '@/components/StaticNewsSummaryBlock'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { fetchAllStaticData, StaticPageData } from '@/lib/staticDataFetcher'

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

// Enable static generation with revalidation for App Router
export const revalidate = 300 // Revalidate every 5 minutes

export default async function Home() {
  let staticData: StaticPageData | null = null
  
  try {
    console.log('🔄 Generating static data for homepage...')
    staticData = await fetchAllStaticData()
  } catch (error) {
    console.error('❌ Error fetching static data:', error)
  }
  
  // If static data failed to load, show error message
  if (!staticData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation title="Ethereum List" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="text-center text-red-600">
              <p>Failed to load static data</p>
              <p className="text-sm text-gray-500 mt-1">Please try refreshing the page</p>
            </div>
          </div>
        </main>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation title="Ethereum List" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ecosystem Overview */}
        <StaticEcosystemSummary data={staticData.ecosystem} />

        {/* Content Blocks Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* ETFs Block */}
          <StaticEtfSummaryBlock 
            etfs={staticData.etfs.etfs} 
            ethPrice={staticData.etfs.ethPrice} 
          />
          
          {/* Treasury Companies Block */}
          <StaticTreasuryCompaniesSummaryBlock 
            companies={staticData.companies.companies} 
            ethPrice={staticData.companies.ethPrice} 
          />
        </div>

        {/* News Block - Full Width */}
        <div className="mb-8">
          <StaticNewsSummaryBlock articles={staticData.news.articles} />
        </div>

        {/* Static Generation Info */}
        <div className="text-center text-xs text-gray-400 mb-4">
          <p>Page generated: {new Date(staticData.generatedAt).toLocaleString('en-US', { 
            timeZone: 'UTC',
            year: 'numeric',
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })} UTC</p>
          <p className="text-green-500">• Statically Generated • Auto-refreshes every 5 minutes</p>
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
