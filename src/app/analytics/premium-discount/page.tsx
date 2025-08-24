'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import CompanyLink from '@/components/CompanyLink'
import FuturisticLayout from '@/components/FuturisticLayout'
import FuturisticCard from '@/components/FuturisticCard'
import { formatNumber, formatEth, formatPercentage } from '@/lib/utils'
import styles from '@/styles/futuristic.module.css'

interface PremiumDiscountData {
  id: number
  name: string
  ticker: string
  ethHoldings: number
  ethValue: number
  marketCap: string
  premiumDiscount: number
  premiumDiscountPercent: number
  ethPrice: number
}

interface AnalyticsData {
  companies: PremiumDiscountData[]
  marketAveragePremium: number
  ethPrice: number
  totalMarketCap: number
  totalEthValue: number
  lastUpdated: string
}

export default function PremiumDiscountAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'premium' | 'name' | 'ethHoldings'>('premium')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('/api/analytics/premium-discount')
      if (!response.ok) throw new Error('Failed to fetch analytics data')
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const sortedCompanies = data?.companies.sort((a, b) => {
    let aValue: number | string
    let bValue: number | string

    switch (sortBy) {
      case 'premium':
        aValue = a.premiumDiscountPercent
        bValue = b.premiumDiscountPercent
        break
      case 'name':
        aValue = a.name
        bValue = b.name
        break
      case 'ethHoldings':
        aValue = a.ethHoldings
        bValue = b.ethHoldings
        break
      default:
        aValue = a.premiumDiscountPercent
        bValue = b.premiumDiscountPercent
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    const numA = Number(aValue)
    const numB = Number(bValue)
    return sortOrder === 'asc' ? numA - numB : numB - numA
  })

  const handleSort = (column: 'premium' | 'name' | 'ethHoldings') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  if (loading) {
    return (
      <FuturisticLayout title="ETH Treasury Basis Analysis" showLiveIndicator={true}>
        <FuturisticCard title="Loading..." icon="⏳">
          <div className="text-center">
            <p>Loading premium/discount analysis...</p>
          </div>
        </FuturisticCard>
      </FuturisticLayout>
    )
  }

  if (error) {
    return (
      <FuturisticLayout title="ETH Treasury Basis Analysis" showLiveIndicator={true}>
        <FuturisticCard title="Error" icon="❌" variant="warning">
          <div className="text-center">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer transition-colors"
            >
              Retry
            </button>
          </div>
        </FuturisticCard>
      </FuturisticLayout>
    )
  }

  return (
    <FuturisticLayout title="ETH Treasury Basis Analysis" showLiveIndicator={true}>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <span>📊</span>
          <span>ETH Treasury Basis Analysis</span>
        </div>
        <p className={styles.pageDescription}>
          Premium/discount analysis comparing company market caps to their ETH treasury values
        </p>
      </div>

      <div className={styles.cardGrid}>
        {/* Summary Stats */}
        {data && (
          <FuturisticCard title="Market Overview" icon="📈" size="large">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {formatPercentage(data.marketAveragePremium)}
                </div>
                <div className="text-gray-400 text-sm">Market Average Premium</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  ${data.ethPrice.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm">Current ETH Price</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {formatNumber(data.totalMarketCap)}
                </div>
                <div className="text-gray-400 text-sm">Total Market Cap</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400">
                  {formatNumber(data.totalEthValue)}
                </div>
                <div className="text-gray-400 text-sm">Total ETH Value</div>
              </div>
            </div>
            <div className="text-center mt-4 text-sm text-gray-400">
              Last updated: {new Date(data.lastUpdated).toLocaleString()}
            </div>
          </FuturisticCard>
        )}

        {/* Analysis Table */}
        <FuturisticCard title="Company Analysis" icon="🏢" size="large">
          <p className="text-gray-400 text-sm mb-4">
            Premium (green) means trading above ETH value, Discount (red) means trading below
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-400"
                    onClick={() => handleSort('name')}
                  >
                    Company {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-400"
                    onClick={() => handleSort('ethHoldings')}
                  >
                    ETH Holdings {sortBy === 'ethHoldings' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    ETH Value
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Market Cap
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-400"
                    onClick={() => handleSort('premium')}
                  >
                    ETH Basis {sortBy === 'premium' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Difference
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sortedCompanies?.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          <CompanyLink 
                            ticker={company.ticker} 
                            name={company.name}
                          />
                        </div>
                        <div className="text-sm text-gray-400">
                          {company.ticker}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-300">
                      {formatEth(company.ethHoldings)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-300">
                      {formatNumber(company.ethValue)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-300">
                      {formatNumber(BigInt(company.marketCap))}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        company.premiumDiscountPercent >= 0
                          ? 'bg-green-900/50 text-green-400'
                          : 'bg-red-900/50 text-red-400'
                      }`}>
                        {company.premiumDiscountPercent >= 0 ? '+' : ''}{formatPercentage(company.premiumDiscountPercent)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                      <span className={company.premiumDiscount >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {company.premiumDiscount >= 0 ? '+' : ''}{formatNumber(Math.abs(company.premiumDiscount))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FuturisticCard>

        {/* Explanation */}
        <FuturisticCard title="How to Read This Analysis" icon="📚">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 text-green-400">Premium (Green)</h4>
              <p className="text-gray-300 text-sm">Company&apos;s market cap is higher than the value of its ETH holdings. Investors are paying extra for the company&apos;s business operations, growth potential, or other assets beyond just ETH.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-red-400">Discount (Red)</h4>
              <p className="text-gray-300 text-sm">Company&apos;s market cap is lower than the value of its ETH holdings. This could indicate undervaluation, market skepticism, or concerns about the company&apos;s ability to realize the full value of its ETH.</p>
            </div>
          </div>
        </FuturisticCard>
      </div>
    </FuturisticLayout>
  )
}
