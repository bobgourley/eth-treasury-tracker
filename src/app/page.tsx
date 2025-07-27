import CompanyList from '@/components/CompanyList'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-900">Ethereum Treasury Companies</h1>
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <Link href="/analytics/premium-discount" className="hover:text-blue-600 transition-colors">
                Premium/Discount
              </Link>
              <span>•</span>
              <Link href="/analytics/exposure" className="hover:text-blue-600 transition-colors">
                ETH Exposure
              </Link>
              <span>•</span>
              <Link href="/analytics/charts" className="hover:text-blue-600 transition-colors">
                Charts
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
          </div>
        </div>
      </footer>
    </div>
  )
}
