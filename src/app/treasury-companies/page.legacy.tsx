import CompanyList from '@/components/CompanyList'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'

export async function generateMetadata() {
  return {
    title: 'ETH Treasury Companies - EthereumList.com',
    description: 'Track public companies holding Ethereum in their treasury reserves. Real-time data on ETH holdings, market caps, and financial metrics.',
  }
}

export default async function TreasuryCompaniesPage() {
  // Server-side data fetching for better performance
  let companyData = null
  let ethPrice = 3825.95
  
  try {
    // Get companies from database
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      orderBy: { ethHoldings: 'desc' }
    })

    // Get ETH price from ecosystem summary
    const ecosystemSummary = await prisma.ecosystemSummary.findFirst({
      orderBy: { lastUpdated: 'desc' }
    })
    
    if (ecosystemSummary) {
      ethPrice = ecosystemSummary.ethPrice
    }

    // Serialize company data
    if (companies && companies.length > 0) {
      companyData = {
        companies: companies.map((company) => ({
          ...company,
          marketCap: company.marketCap?.toString(),
          sharesOutstanding: company.sharesOutstanding?.toString(),
          ethValue: (company.ethHoldings || 0) * ethPrice,
        })),
        count: companies.length,
        ethPrice,
        message: 'Companies data from database'
      }
    }
  } catch (error) {
    console.error('Error fetching company data for SSR:', error)
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation title="ETH Treasury Companies" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CompanyList />
        
        {/* Additional Analysis Tools */}
        <div className="mt-16 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Advanced Treasury Analysis</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* ETH Basis Analysis */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">ETH Basis Analysis</h3>
              <p className="text-gray-600 text-sm mb-3">
                Analyze premium/discount ratios and market-to-NAV relationships for ETH treasury companies. 
                Track how stock prices compare to underlying ETH holdings value.
              </p>
              <Link 
                href="/analytics/premium-discount" 
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View ETH Basis Analysis →
              </Link>
            </div>
            
            {/* ETH Exposure Analysis */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">ETH Exposure Analysis</h3>
              <p className="text-gray-600 text-sm mb-3">
                Examine ETH exposure ratios, holdings concentration, and portfolio allocation strategies 
                across different treasury companies and market segments.
              </p>
              <Link 
                href="/analytics/exposure" 
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View ETH Exposure Analysis →
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2025 Ethereum Treasury Tracker. Data sourced from public APIs, CoinGecko, EtherScan, Alpha Vantage and company websites.</p>
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
