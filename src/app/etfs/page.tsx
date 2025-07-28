import EtfList from '@/components/EtfList'
import Navigation from '@/components/Navigation'
import Link from 'next/link'

export default function EtfsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation title="Ethereum ETFs" />

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
