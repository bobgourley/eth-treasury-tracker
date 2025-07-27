'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import CompanyLink from '@/components/CompanyLink'
import { formatNumber, formatEth, formatPercentage } from '@/lib/utils'

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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-600 text-lg font-semibold">Error: {error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
                <span>•</span>
                <Link href="/analytics/premium-discount" className="hover:text-blue-600 transition-colors">
                  ETH Basis
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
                <Link href="/about" className="hover:text-blue-600 transition-colors">
                  About
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                ETH Treasury Basis Analysis
              </h1>
              <p className="text-gray-600 mt-1">
                Analyze how companies trade relative to their ETH holdings value
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        {data && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl lg:text-3xl font-bold">
                  {formatPercentage(data.marketAveragePremium)}
                </p>
                <p className="text-blue-100 text-sm">Market Average Premium</p>
              </div>
              <div className="text-center">
                <p className="text-2xl lg:text-3xl font-bold">
                  ${data.ethPrice.toLocaleString()}
                </p>
                <p className="text-blue-100 text-sm">Current ETH Price</p>
              </div>
              <div className="text-center">
                <p className="text-2xl lg:text-3xl font-bold">
                  ${formatNumber(data.totalMarketCap)}
                </p>
                <p className="text-blue-100 text-sm">Total Market Cap</p>
              </div>
              <div className="text-center">
                <p className="text-2xl lg:text-3xl font-bold">
                  ${formatNumber(data.totalEthValue)}
                </p>
                <p className="text-blue-100 text-sm">Total ETH Value</p>
              </div>
            </div>
            <div className="text-center mt-4 text-sm text-blue-100">
              Last updated: {new Date(data.lastUpdated).toLocaleString()}
            </div>
          </div>
        )}

        {/* Analysis Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Company Analysis</h2>
            <p className="text-sm text-gray-600 mt-1">
              Premium (green) means trading above ETH value, Discount (red) means trading below
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    Company {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('ethHoldings')}
                  >
                    ETH Holdings {sortBy === 'ethHoldings' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ETH Value
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Cap
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('premium')}
                  >
                    ETH Basis {sortBy === 'premium' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difference
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCompanies?.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            <CompanyLink 
                              ticker={company.ticker} 
                              name={company.name}
                            />
                          </div>
                          <div className="text-sm text-gray-500">
                            {company.ticker}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatEth(company.ethHoldings)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatNumber(company.ethValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatNumber(BigInt(company.marketCap))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        company.premiumDiscountPercent >= 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {company.premiumDiscountPercent >= 0 ? '+' : ''}{formatPercentage(company.premiumDiscountPercent)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      <span className={company.premiumDiscount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {company.premiumDiscount >= 0 ? '+' : ''}{formatNumber(Math.abs(company.premiumDiscount))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Read This Analysis</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">Premium (Green)</h4>
              <p>Company&apos;s market cap is higher than the value of its ETH holdings. Investors are paying extra for the company&apos;s business operations, growth potential, or other assets beyond just ETH.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Discount (Red)</h4>
              <p>Company&apos;s market cap is lower than the value of its ETH holdings. This could indicate undervaluation, market skepticism, or concerns about the company&apos;s ability to realize the full value of its ETH.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
