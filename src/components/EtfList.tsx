'use client'

import { useState, useEffect } from 'react'
import { Etf, EtfSummary } from '@/types/etf'
import EtfCard from './EtfCard'

export default function EtfList() {
  const [etfs, setEtfs] = useState<Etf[]>([])
  const [metrics, setMetrics] = useState<EtfSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchEtfData()
  }, [])

  const fetchEtfData = async () => {
    try {
      setLoading(true)
      
      // Fetch ETFs and metrics in parallel
      const [etfsResponse, metricsResponse] = await Promise.all([
        fetch('/api/etfs'),
        fetch('/api/etfs/metrics')
      ])
      
      if (etfsResponse.ok) {
        const etfsData = await etfsResponse.json()
        setEtfs(etfsData.etfs || [])
      }
      
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData)
      }
      
      setError(null)
    } catch (err) {
      setError('Failed to fetch ETF data')
      console.error('Error fetching ETF data:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateEtfData = async () => {
    try {
      setUpdating(true)
      
      const response = await fetch('/api/etfs/update', {
        method: 'POST'
      })
      
      if (response.ok) {
        // Refresh data after update
        await fetchEtfData()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update ETF data')
      }
    } catch (err) {
      setError('Failed to update ETF data')
      console.error('Error updating ETF data:', err)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading ETF data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {metrics && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Ethereum ETF Overview</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{etfs.length}</div>
              <div className="text-sm opacity-90">Total ETFs</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold">
                {metrics.totalEthHeld >= 1e6 
                  ? `${(metrics.totalEthHeld / 1e6).toFixed(1)}M`
                  : metrics.totalEthHeld >= 1e3
                  ? `${(metrics.totalEthHeld / 1e3).toFixed(1)}K`
                  : metrics.totalEthHeld.toFixed(0)
                }
              </div>
              <div className="text-sm opacity-90">Total ETH Held</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold">
                {metrics.totalAum >= 1e9 
                  ? `$${(metrics.totalAum / 1e9).toFixed(1)}B`
                  : metrics.totalAum >= 1e6
                  ? `$${(metrics.totalAum / 1e6).toFixed(1)}M`
                  : `$${(metrics.totalAum / 1e3).toFixed(1)}K`
                }
              </div>
              <div className="text-sm opacity-90">Total AUM</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold">
                {metrics.totalValue >= 1e9 
                  ? `$${(metrics.totalValue / 1e9).toFixed(1)}B`
                  : metrics.totalValue >= 1e6
                  ? `$${(metrics.totalValue / 1e6).toFixed(1)}M`
                  : `$${(metrics.totalValue / 1e3).toFixed(1)}K`
                }
              </div>
              <div className="text-sm opacity-90">Total ETH Value</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold">
                {`${((metrics.totalEthHeld / 120500000) * 100).toFixed(3)}%`}
              </div>
              <div className="text-sm opacity-90">% of ETH Supply</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white border-opacity-20">
            <div className="flex justify-between items-center text-sm opacity-90">
              <span>
                Average Expense Ratio: {etfs.length > 0 ? `${(etfs.reduce((sum, etf) => sum + (etf.expenseRatio || 0), 0) / etfs.length).toFixed(2)}%` : 'N/A'}
              </span>
              <span>
                ETH Price: ${metrics.ethPrice?.toFixed(2) || 'N/A'}
              </span>
              <span>
                Last Updated: {new Date().toLocaleDateString('en-US', { 
                  month: 'numeric', 
                  day: 'numeric', 
                  year: 'numeric'
                }) + ' ' + new Date().toLocaleTimeString('en-US', {
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 font-medium">Error</div>
          <div className="text-red-700 mt-1">{error}</div>
          <button
            onClick={fetchEtfData}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ETF Cards */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">
            Ethereum ETFs ({etfs.length})
          </h3>
          <div className="text-sm text-gray-500">
            Sorted by ETH Holdings
          </div>
        </div>
        
        {etfs.length > 0 ? (
          <div className="space-y-4">
            {etfs.map((etf, index) => (
              <EtfCard
                key={etf.symbol}
                etf={etf}
                rank={index + 1}
                ethPrice={metrics?.ethPrice}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No ETF data available</div>
            <button
              onClick={updateEtfData}
              disabled={updating}
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {updating ? 'Loading...' : 'Load ETF Data'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
