import { memo } from 'react'
import { StaticEcosystemData } from '@/lib/staticDataFetcher'

interface StaticEcosystemSummaryProps {
  data: StaticEcosystemData
}

function StaticEcosystemSummary({ data }: StaticEcosystemSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Ethereum Ecosystem Overview</h2>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">ETH Price</p>
          <p className="text-2xl font-bold text-blue-600">{data.formatted.ethPrice}</p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Total ETH Supply</p>
          <p className="text-2xl font-bold text-gray-900">{data.formatted.ethSupply}</p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Tracked ETH</p>
          <p className="text-2xl font-bold text-green-600">{data.formatted.totalTrackedEth}</p>
          <p className="text-xs text-gray-400">{data.formatted.totalTrackedPercentage} of supply</p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Total Value</p>
          <p className="text-2xl font-bold text-purple-600">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(data.companies.totalValue + data.etfs.totalValue)}
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
        {/* Treasury Companies */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Treasury Companies</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-blue-700">Companies:</span>
              <span className="font-medium text-blue-900">{data.companies.count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-blue-700">ETH Holdings:</span>
              <span className="font-medium text-blue-900">{data.formatted.companyEth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-blue-700">Total Value:</span>
              <span className="font-medium text-blue-900">{data.formatted.companyValue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-blue-700">% of ETH Supply:</span>
              <span className="font-medium text-blue-900">{data.formatted.companyPercentage}</span>
            </div>
          </div>
        </div>

        {/* ETFs */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">Ethereum ETFs</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-green-700">ETFs:</span>
              <span className="font-medium text-green-900">{data.etfs.count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-green-700">ETH Holdings:</span>
              <span className="font-medium text-green-900">{data.formatted.etfEth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-green-700">Total Value:</span>
              <span className="font-medium text-green-900">{data.formatted.etfValue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-green-700">% of ETH Supply:</span>
              <span className="font-medium text-green-900">{data.formatted.etfPercentage}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-400 text-center mt-4">
        Last updated: {new Date(data.lastUpdated).toLocaleString('en-US', { 
          timeZone: 'UTC',
          year: 'numeric',
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })} UTC
        <span className="ml-2 text-green-500">• Static</span>
      </div>
    </div>
  )
}

// Memoize component for performance
export default memo(StaticEcosystemSummary)
