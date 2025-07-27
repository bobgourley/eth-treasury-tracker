import CompanyList from '@/components/CompanyList'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Ethereum Treasury Tracker
              </h1>
              <p className="text-gray-600 mt-1">
                Track companies whose primary business model is Ethereum Treasury
              </p>
            </div>
            <div className="flex items-center space-x-6">
              {/* Navigation Menu */}
              <nav className="hidden md:flex space-x-4">
                <Link 
                  href="/analytics/premium-discount" 
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Premium/Discount Analysis
                </Link>
                <span className="text-gray-300">|</span>
                <span className="text-gray-400 text-sm">More analytics coming soon</span>
              </nav>
              
              {/* Live Data Indicator */}
              <div className="text-right">
                <div className="text-sm text-gray-500">Live Data</div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Updated Daily</span>
                </div>
              </div>
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
          </div>
        </div>
      </footer>
    </div>
  )
}
