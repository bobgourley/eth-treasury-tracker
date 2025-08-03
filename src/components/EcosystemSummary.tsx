'use client'

import { useState, useEffect, memo } from 'react'

interface EcosystemData {
  ethPrice: number
  ethSupply: number
  totalTrackedEth: number
  totalTrackedPercentage: number
  companies: {
    count: number
    totalEth: number
    totalValue: number
    percentage: number
  }
  etfs: {
    count: number
    totalEth: number
    totalValue: number
    percentage: number
  }
  formatted: {
    ethPrice: string
    ethSupply: string
    totalTrackedEth: string
    totalTrackedPercentage: string
    companyEth: string
    companyValue: string
    companyPercentage: string
    etfEth: string
    etfValue: string
    etfPercentage: string
  }
  lastUpdated: string
}

function EcosystemSummary() {
  const [data, setData] = useState<EcosystemData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/ecosystem/summary')
        if (!response.ok) {
          throw new Error('Failed to fetch ecosystem data')
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="text-center text-red-600">
          <p>Failed to load ecosystem summary</p>
          {error && <p className="text-sm text-gray-500 mt-1">{error}</p>}
        </div>
      </div>
    )
  }

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
      </div>
    </div>
  )
}

// Memoize component for performance
export default memo(EcosystemSummary)
