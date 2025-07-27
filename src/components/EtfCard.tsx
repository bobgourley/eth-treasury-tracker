'use client'

import { Etf } from '@/types/etf'

interface EtfCardProps {
  etf: Etf
  rank: number
  ethPrice?: number
}

// Helper functions (isolated from company utils)
function formatNumber(value: number): string {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`
  }
  return `$${value.toFixed(2)}`
}

function formatEth(value: number): string {
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M ETH`
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K ETH`
  }
  return `${value.toFixed(2)} ETH`
}

function formatPercentage(value?: number): string {
  if (!value) return 'N/A'
  return `${value.toFixed(2)}%`
}

export default function EtfCard({ etf, rank, ethPrice }: EtfCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      {/* ETF Summary Row */}
      <div className="p-4">
        {/* Mobile Layout */}
        <div className="flex items-center justify-between sm:hidden">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {rank}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1">
                <h3 className="text-sm font-bold text-gray-900 truncate">
                  {etf.symbol}
                </h3>
                {etf.name && (
                  <span className="text-xs text-gray-600 flex-shrink-0">
                    {etf.name.replace(' ETF', '')}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3 mt-1">
                <div className="text-left">
                  <p className="text-sm font-bold text-blue-600">
                    {formatEth(etf.ethHoldings || 0)}
                  </p>
                  <p className="text-xs text-gray-500">ETH Holdings</p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-green-600">
                    {formatNumber(etf.totalValue || 0)}
                  </p>
                  <p className="text-xs text-gray-500">ETH Value</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="bg-purple-100 text-purple-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
              {rank}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-gray-900">
                  {etf.symbol}
                </h3>
                {etf.name && (
                  <span className="text-sm text-gray-600">
                    {etf.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-xl font-bold text-blue-600">
                {formatEth(etf.ethHoldings || 0)}
              </p>
              <p className="text-xs text-gray-500">ETH Holdings</p>
            </div>
            
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">
                {formatNumber(etf.totalValue || 0)}
              </p>
              <p className="text-xs text-gray-500">ETH Value</p>
            </div>
            
            <div className="text-right">
              <p className="text-lg font-bold text-purple-600">
                {formatNumber(etf.aum || 0)}
              </p>
              <p className="text-xs text-gray-500">Total AUM</p>
            </div>
          </div>
        </div>

        {/* Additional Metrics Row (Desktop) */}
        <div className="hidden sm:block mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">NAV</p>
              <p className="font-semibold text-gray-900">
                {etf.nav ? `$${etf.nav.toFixed(2)}` : 'N/A'}
              </p>
            </div>
            
            <div>
              <p className="text-gray-600">Expense Ratio</p>
              <p className="font-semibold text-gray-900">
                {formatPercentage(etf.expenseRatio)}
              </p>
            </div>
            
            <div>
              <p className="text-gray-600">ETH %</p>
              <p className="font-semibold text-blue-600">
                {etf.aum && etf.totalValue && etf.aum > 0 
                  ? `${((etf.totalValue / etf.aum) * 100).toFixed(1)}%`
                  : 'N/A'
                }
              </p>
            </div>
            
            <div>
              <p className="text-gray-600">Last Updated</p>
              <p className="font-semibold text-gray-900 text-xs">
                {new Date(etf.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Additional Metrics */}
        <div className="sm:hidden mt-3 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-600">Total AUM</p>
              <p className="font-semibold text-purple-600">
                {formatNumber(etf.aum || 0)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Expense Ratio</p>
              <p className="font-semibold text-gray-900">
                {formatPercentage(etf.expenseRatio)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
