'use client'

import { useState, useEffect } from 'react'
import { Company, SystemMetrics } from '@/types/company'
import CompanyCard from './CompanyCard'
import { formatEth, formatNumber } from '@/lib/utils'

export default function CompanyList() {
  const [companies, setCompanies] = useState<(Company & { marketCap?: string; sharesOutstanding?: string; stockPrice?: number })[]>([])
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesRes, metricsRes] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/metrics')
        ])

        if (!companiesRes.ok || !metricsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const companiesData = await companiesRes.json()
        const metricsData = await metricsRes.json()

        setCompanies(companiesData)
        setMetrics(metricsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-semibold">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {metrics && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-2xl lg:text-3xl font-bold">{formatEth(metrics.totalEthHoldings)}</p>
              <p className="text-blue-100 text-sm">Total ETH Holdings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl lg:text-3xl font-bold">
                {metrics.totalEthValue ? formatNumber(metrics.totalEthValue) : 'N/A'}
              </p>
              <p className="text-blue-100 text-sm">Total ETH Value</p>
            </div>
            <div className="text-center">
              <p className="text-2xl lg:text-3xl font-bold">
                {metrics.totalMarketCap ? formatNumber(metrics.totalMarketCap) : 'N/A'}
              </p>
              <p className="text-blue-100 text-sm">Total Market Cap</p>
            </div>
            <div className="text-center">
              <p className="text-2xl lg:text-3xl font-bold">
                {metrics.ethPrice ? `$${metrics.ethPrice.toLocaleString()}` : 'N/A'}
              </p>
              <p className="text-blue-100 text-sm">ETH Price</p>
            </div>
            <div className="text-center">
              <p className="text-2xl lg:text-3xl font-bold">
                {metrics.ethSupplyPercent ? `${metrics.ethSupplyPercent.toFixed(3)}%` : 'N/A'}
              </p>
              <p className="text-blue-100 text-sm">% of ETH Supply</p>
            </div>
            <div className="text-center">
              <p className="text-2xl lg:text-3xl font-bold">{metrics.totalCompanies}</p>
              <p className="text-blue-100 text-sm">Companies Tracked</p>
            </div>
          </div>
          <div className="text-center mt-4 text-sm text-blue-100">
            Last updated: {new Date(metrics.lastUpdate).toLocaleString()}
          </div>
        </div>
      )}

      {/* Company List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ethereum Treasury Companies
        </h2>
        {companies.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No companies found.
          </div>
        ) : (
          companies.map((company, index) => (
            <CompanyCard 
              key={company.id} 
              company={company} 
              rank={index + 1}
              ethPrice={metrics?.ethPrice}
            />
          ))
        )}
      </div>
    </div>
  )
}
