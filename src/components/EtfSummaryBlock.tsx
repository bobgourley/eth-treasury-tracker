'use client'

import { useEffect, useState, memo } from 'react'
import Link from 'next/link'

interface EtfData {
  symbol: string
  name: string
  ethHoldings: number
  totalValue: number
  aum: number
}

export default function EtfSummaryBlock() {
  const [etfs, setEtfs] = useState<EtfData[]>([])
  const [loading, setLoading] = useState(true)
  const [totalValue, setTotalValue] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/etfs')
        if (response.ok) {
          const data = await response.json()
          const sortedEtfs = (data.etfs || [])
            .filter((etf: EtfData) => etf.ethHoldings > 0)
            .sort((a: EtfData, b: EtfData) => (b.aum || 0) - (a.aum || 0))
            .slice(0, 5) // Top 5 ETFs
          
          setEtfs(sortedEtfs)
          setTotalValue(sortedEtfs.reduce((sum: number, etf: EtfData) => sum + (etf.totalValue || 0), 0))
        }
      } catch (error) {
        console.error('Failed to fetch ETF data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          <Link href="/etfs" className="hover:text-blue-600 transition-colors">
            Ethereum ETFs
          </Link>
        </h3>
        <Link 
          href="/etfs" 
          className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          View All →
        </Link>
      </div>

      {etfs.length > 0 ? (
        <>
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-green-700">Total ETF Value</div>
            <div className="text-xl font-bold text-green-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(totalValue)}
            </div>
          </div>

          <div className="space-y-3">
            {etfs.map((etf) => (
              <div key={etf.symbol} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <div className="font-medium text-gray-900">{etf.symbol}</div>
                  <div className="text-sm text-gray-500 truncate max-w-48">
                    {etf.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(etf.ethHoldings)} ETH
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      notation: 'compact',
                      maximumFractionDigits: 1
                    }).format(etf.aum || 0)} AUM
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p>No ETF data available</p>
        </div>
      )}
    </div>
  )
}
