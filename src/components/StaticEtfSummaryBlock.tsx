import { memo } from 'react'
import Link from 'next/link'
import { StaticETFData } from '@/lib/staticDataFetcher'

interface StaticEtfSummaryBlockProps {
  etfs: StaticETFData[]
  ethPrice: number
}

function StaticEtfSummaryBlock({ etfs, ethPrice }: StaticEtfSummaryBlockProps) {
  // Calculate total ETF value
  const totalEtfValue = etfs.reduce((sum, etf) => sum + ((etf.ethHoldings || 0) * ethPrice), 0)

  // Get top 5 ETFs for display
  const topEtfs = etfs.slice(0, 5)

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Ethereum ETFs</h2>
        <Link 
          href="/etfs" 
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All →
        </Link>
      </div>

      {/* Total Value */}
      <div className="bg-green-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-green-700 mb-1">Total ETF Value</p>
        <p className="text-2xl font-bold text-green-900">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(totalEtfValue)}
        </p>
      </div>

      {/* ETF List */}
      <div className="space-y-4">
        {topEtfs.map((etf) => (
          <div key={etf.id} className="flex justify-between items-center">
            <div className="flex-1">
              <div className="font-medium text-gray-900">{etf.symbol}</div>
              <div className="text-sm text-gray-500 truncate">{etf.name}</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">
                {new Intl.NumberFormat('en-US').format(etf.ethHoldings || 0)} ETH
              </div>
              <div className="text-sm text-gray-500">
                {etf.aum && Number(etf.aum) > 0 
                  ? `$${(Number(etf.aum) / 1000000).toFixed(1)}B AUM`
                  : `$${(etf.totalValue / 1000000).toFixed(0)}M AUM`
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-400 text-center mt-4">
        <span className="text-green-500">• Static Data</span>
      </div>
    </div>
  )
}

export default memo(StaticEtfSummaryBlock)
