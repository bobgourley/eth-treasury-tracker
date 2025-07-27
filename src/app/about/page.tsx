import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-900">About</h1>
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
              <span>•</span>
              <Link href="/news" className="hover:text-blue-600 transition-colors">
                News
              </Link>
              <span>•</span>
              <Link href="/etfs" className="hover:text-blue-600 transition-colors">
                ETFs
              </Link>
              <span>•</span>
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-lg mb-12">
          <h2 className="text-3xl font-bold mb-4">Ethereum Treasury Companies</h2>
          <p className="text-xl opacity-90">
            Track and analyze publicly traded companies that hold Ethereum as a strategic treasury asset.
          </p>
        </div>

        {/* What is this site */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Ethereum Treasury Companies?</h3>
          <div className="prose prose-lg text-gray-700 space-y-4">
            <p>
              Ethereum Treasury Companies is a comprehensive analytics platform that tracks publicly traded companies 
              holding Ethereum (ETH) as a strategic treasury asset. We provide real-time data, advanced analytics, 
              and interactive visualizations to help investors, analysts, and researchers understand the growing 
              institutional adoption of Ethereum.
            </p>
            <p>
              Our platform aggregates data from multiple sources including stock exchanges, blockchain networks, 
              and company filings to provide the most accurate and up-to-date information about corporate Ethereum holdings.
            </p>
          </div>
        </section>

        {/* What are ETH Treasury Companies */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">What are Ethereum Treasury Companies?</h3>
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="prose prose-lg text-gray-700 space-y-4">
              <p>
                <strong>Ethereum Treasury Companies</strong> are publicly traded corporations that hold Ethereum (ETH) 
                as a strategic asset on their balance sheets. These companies view ETH as:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Store of Value:</strong> A digital asset that preserves purchasing power over time</li>
                <li><strong>Treasury Diversification:</strong> An alternative to traditional cash and bonds</li>
                <li><strong>Inflation Hedge:</strong> Protection against currency debasement and inflation</li>
                <li><strong>Strategic Investment:</strong> Exposure to the growing Ethereum ecosystem</li>
                <li><strong>Operational Asset:</strong> For companies building on Ethereum infrastructure</li>
              </ul>
              <p>
                Unlike individual investors or private funds, these companies provide transparent, audited disclosure 
                of their ETH holdings through quarterly financial reports and SEC filings.
              </p>
            </div>
          </div>
        </section>

        {/* Why only publicly traded */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Only Publicly Traded Companies?</h3>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="prose prose-lg text-gray-700 space-y-4">
              <p>
                We focus exclusively on publicly traded companies for several important reasons:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-3">📊 Transparency & Accountability</h4>
                  <p className="text-blue-800">
                    Public companies must disclose material holdings in quarterly reports (10-Q) and annual reports (10-K), 
                    providing verified, audited data about their ETH positions.
                  </p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h4 className="font-bold text-green-900 mb-3">📈 Investment Accessibility</h4>
                  <p className="text-green-800">
                    Investors can gain ETH exposure through traditional stock markets without directly holding 
                    cryptocurrency, making it accessible through retirement accounts and institutional portfolios.
                  </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h4 className="font-bold text-purple-900 mb-3">⚖️ Regulatory Compliance</h4>
                  <p className="text-purple-800">
                    Public companies operate under strict SEC oversight, ensuring proper custody, accounting, 
                    and risk management of their digital assets.
                  </p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h4 className="font-bold text-orange-900 mb-3">📊 Market Impact</h4>
                  <p className="text-orange-800">
                    Public company ETH holdings represent institutional validation and can significantly 
                    influence market sentiment and adoption trends.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Site Features */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Site Features & Pages</h3>
          
          {/* Main Dashboard */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">
                  <Link href="/" className="hover:text-blue-600">Main Dashboard</Link>
                </h4>
                <p className="text-gray-600">Real-time overview of all tracked companies</p>
              </div>
            </div>
            <div className="prose text-gray-700">
              <p>
                The main dashboard provides a comprehensive overview of all tracked Ethereum treasury companies. 
                Features include total ETH holdings across all companies, current ETH price, market statistics, 
                and a sortable table of companies with their stock prices, ETH holdings, market caps, and key metrics.
              </p>
            </div>
          </div>

          {/* Premium/Discount Analytics */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">
                  <Link href="/analytics/premium-discount" className="hover:text-blue-600">Premium/Discount Analytics</Link>
                </h4>
                <p className="text-gray-600">Identify undervalued and overvalued ETH treasury companies</p>
              </div>
            </div>
            <div className="prose text-gray-700">
              <p>
                This advanced analytics page calculates whether companies are trading at a premium or discount 
                to their underlying ETH holdings value. It helps investors identify potential arbitrage opportunities 
                and undervalued companies. The analysis includes fair value calculations, premium/discount percentages, 
                and market efficiency metrics.
              </p>
            </div>
          </div>

          {/* ETH Exposure Analytics */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">
                  <Link href="/analytics/exposure" className="hover:text-blue-600">ETH Exposure Analytics</Link>
                </h4>
                <p className="text-gray-600">Analyze market concentration and ETH exposure metrics</p>
              </div>
            </div>
            <div className="prose text-gray-700">
              <p>
                The ETH Exposure page provides sophisticated analysis of market concentration and company-specific 
                ETH exposure. It features ECMC (ETH Component of Market Cap) and ETCD (ETH Treasury Company Dominance) 
                metrics, diversification analysis, and baseline comparisons to help understand market structure and concentration risks.
              </p>
            </div>
          </div>

          {/* Charts Dashboard */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">
                  <Link href="/analytics/charts" className="hover:text-blue-600">Interactive Charts</Link>
                </h4>
                <p className="text-gray-600">Visual data exploration with interactive charts</p>
              </div>
            </div>
            <div className="prose text-gray-700">
              <p>
                The Charts dashboard transforms complex data into intuitive visual representations. Currently features 
                an interactive ETH Holdings Distribution chart showing market share across companies, with plans for 
                additional visualizations including premium/discount charts, historical trends, and market concentration analysis.
              </p>
            </div>
          </div>
        </section>

        {/* Data Sources */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Data Sources & Methodology</h3>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="prose prose-lg text-gray-700 space-y-4">
              <p>
                Our platform aggregates data from multiple authoritative sources to ensure accuracy and completeness:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Stock Market Data:</strong> Real-time stock prices and market capitalizations from major exchanges</li>
                <li><strong>Blockchain Data:</strong> ETH holdings verified through on-chain analysis and company-disclosed wallet addresses</li>
                <li><strong>Company Filings:</strong> SEC 10-Q and 10-K reports for official ETH holding disclosures</li>
                <li><strong>Market Data:</strong> Current ETH prices and market metrics from leading cryptocurrency data providers</li>
              </ul>
              <p>
                All data is updated in real-time where possible, with manual verification of company ETH holdings 
                through official sources and public announcements.
              </p>
            </div>
          </div>
        </section>

        {/* Contact/Footer */}
        <section className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-600 mb-4">
            Ethereum Treasury Companies - Track the institutional adoption of Ethereum
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">Dashboard</Link>
            <Link href="/analytics/premium-discount" className="hover:text-blue-600">Analytics</Link>
            <Link href="/analytics/charts" className="hover:text-blue-600">Charts</Link>
            <Link href="/news" className="hover:text-blue-600">News</Link>
            <Link href="/sitemap.xml" className="hover:text-blue-600">Sitemap</Link>
          </div>
        </section>
      </main>
    </div>
  )
}
