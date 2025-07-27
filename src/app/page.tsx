import CompanyList from '@/components/CompanyList'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Ethereum Treasury Companies</h1>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3 text-xs text-gray-500">
              <Link href="/analytics/premium-discount" className="hover:text-blue-600 transition-colors">
                ETH Basis
              </Link>
              <span>•</span>
              <Link href="/analytics/exposure" className="hover:text-blue-600 transition-colors">
                ETH Exposure
              </Link>
              <span>•</span>
              <Link href="/analytics/charts" className="hover:text-blue-600 transition-colors">
                Charts
              </Link>
              <span>•</span>
              <Link href="/news" className="hover:text-blue-600 transition-colors">
                News
              </Link>
              <span>•</span>
              <Link href="/etfs" className="hover:text-blue-600 transition-colors">
                ETFs
              </Link>
              <span>•</span>
              <Link href="/about" className="hover:text-blue-600 transition-colors">
                About
              </Link>
            </div>
            
            {/* Mobile Navigation */}
            <div className="md:hidden flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <Link href="/analytics/premium-discount" className="hover:text-blue-600 transition-colors px-2 py-1 bg-gray-100 rounded">
                ETH Basis
              </Link>
              <Link href="/analytics/exposure" className="hover:text-blue-600 transition-colors px-2 py-1 bg-gray-100 rounded">
                Exposure
              </Link>
              <Link href="/analytics/charts" className="hover:text-blue-600 transition-colors px-2 py-1 bg-gray-100 rounded">
                Charts
              </Link>
              <Link href="/news" className="hover:text-blue-600 transition-colors px-2 py-1 bg-gray-100 rounded">
                News
              </Link>
              <Link href="/etfs" className="hover:text-blue-600 transition-colors px-2 py-1 bg-gray-100 rounded">
                ETFs
              </Link>
              <Link href="/about" className="hover:text-blue-600 transition-colors px-2 py-1 bg-gray-100 rounded">
                About
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CompanyList />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p> 2025 Ethereum Treasury Tracker. Data sourced from public APIs, CoinGecko, EtherScan, Alpha Vantage and company websites.</p>
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
