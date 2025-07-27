import EtfList from '@/components/EtfList'
import Link from 'next/link'

export default function EtfsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-900">Ethereum ETFs</h1>
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
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <span>•</span>
              <Link href="/about" className="hover:text-blue-600 transition-colors">
                About
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Description */}
        <div className="mb-8">
          <p className="text-gray-600 text-lg">
            Track Ethereum Exchange-Traded Funds (ETFs) and their ETH holdings, total assets under management, and key metrics.
          </p>
        </div>

        <EtfList />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2025 Ethereum Treasury Tracker. ETF data sourced from Financial Modeling Prep API.</p>
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
