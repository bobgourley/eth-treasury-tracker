'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatNumber, formatEth, formatPercentage } from '@/lib/utils'

interface ExposureData {
  id: number
  name: string
  ticker: string
  ethHoldings: number
  ethValue: number
  marketCap: string
  marketCapWeight: number
  ethExposureWeight: number
  ethConcentrationRisk: number
  diversificationScore: number
}

interface ExposureAnalytics {
  companies: ExposureData[]
  totalMarketCap: number
  totalEthValue: number
  averageEthExposure: number
  concentrationRisk: string
  diversificationIndex: number
  topThreeConcentration: number
  ethPrice: number
  lastUpdated: string
}

export default function MarketCapWeightedExposure() {
  const [data, setData] = useState<ExposureAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'marketWeight' | 'ethWeight' | 'concentration' | 'name'>('marketWeight')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchExposureData()
  }, [])

  const fetchExposureData = async () => {
    try {
      const response = await fetch('/api/analytics/exposure')
      if (!response.ok) throw new Error('Failed to fetch exposure data')
      
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
      case 'marketWeight':
        aValue = a.marketCapWeight
        bValue = b.marketCapWeight
        break
      case 'ethWeight':
        aValue = a.ethExposureWeight
        bValue = b.ethExposureWeight
        break
      case 'concentration':
        aValue = a.ethConcentrationRisk
        bValue = b.ethConcentrationRisk
        break
      case 'name':
        aValue = a.name
        bValue = b.name
        break
      default:
        aValue = a.marketCapWeight
        bValue = b.marketCapWeight
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    const numA = Number(aValue)
    const numB = Number(bValue)
    return sortOrder === 'asc' ? numA - numB : numB - numA
  })

  const handleSort = (column: 'marketWeight' | 'ethWeight' | 'concentration' | 'name') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const getRiskLevel = (risk: number) => {
    if (risk >= 70) return { level: 'High', color: 'text-red-600 bg-red-100' }
    if (risk >= 40) return { level: 'Medium', color: 'text-yellow-600 bg-yellow-100' }
    return { level: 'Low', color: 'text-green-600 bg-green-100' }
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
              <div className="flex items-center space-x-4 mb-2">
                <Link href="/analytics/premium-discount" className="text-blue-600 hover:text-blue-800">
                  ← Premium/Discount Analysis
                </Link>
                <span className="text-gray-300">|</span>
                <Link href="/" className="text-blue-600 hover:text-blue-800">
                  Back to Dashboard
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Market Cap Weighted ETH Exposure
              </h1>
              <p className="text-gray-600 mt-1">
                Analyze risk concentration and diversification across ETH treasury companies
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        {data && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl lg:text-3xl font-bold">
                  {formatPercentage(data.averageEthExposure)}
                </p>
                <p className="text-purple-100 text-sm">Average ETH Exposure</p>
              </div>
              <div className="text-center">
                <p className="text-2xl lg:text-3xl font-bold">
                  {data.concentrationRisk}
                </p>
                <p className="text-purple-100 text-sm">Concentration Risk</p>
              </div>
              <div className="text-center">
                <p className="text-2xl lg:text-3xl font-bold">
                  {formatPercentage(data.topThreeConcentration)}
                </p>
                <p className="text-purple-100 text-sm">Top 3 Concentration</p>
              </div>
              <div className="text-center">
                <p className="text-2xl lg:text-3xl font-bold">
                  {data.diversificationIndex.toFixed(1)}
                </p>
                <p className="text-purple-100 text-sm">Diversification Index</p>
              </div>
            </div>
            <div className="text-center mt-4 text-sm text-purple-100">
              Last updated: {new Date(data.lastUpdated).toLocaleString()}
            </div>
          </div>
        )}

        {/* Risk Analysis Cards */}
        {data && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Market Concentration</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Market Cap:</span>
                  <span className="text-sm font-medium">${formatNumber(data.totalMarketCap)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total ETH Value:</span>
                  <span className="text-sm font-medium">${formatNumber(data.totalEthValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ETH/Market Ratio:</span>
                  <span className="text-sm font-medium">
                    {formatPercentage((data.totalEthValue / data.totalMarketCap) * 100)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Risk Assessment</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Overall Risk:</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRiskLevel(data.topThreeConcentration).color}`}>
                      {getRiskLevel(data.topThreeConcentration).level}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(data.topThreeConcentration, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Diversification</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Companies Tracked:</span>
                  <span className="text-sm font-medium">{data.companies.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Diversification Score:</span>
                  <span className="text-sm font-medium">{data.diversificationIndex.toFixed(1)}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current ETH Price:</span>
                  <span className="text-sm font-medium">${data.ethPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exposure Analysis Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Company Exposure Analysis</h2>
            <p className="text-sm text-gray-600 mt-1">
              Market cap weighted analysis of ETH exposure and concentration risk
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ETH Holdings
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('marketWeight')}
                  >
                    Market Weight {sortBy === 'marketWeight' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('ethWeight')}
                  >
                    ETH Weight {sortBy === 'ethWeight' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('concentration')}
                  >
                    Concentration Risk {sortBy === 'concentration' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCompanies?.map((company) => {
                  const riskLevel = getRiskLevel(company.ethConcentrationRisk)
                  return (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {company.name}
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
                        {formatPercentage(company.marketCapWeight)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatPercentage(company.ethExposureWeight)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatPercentage(company.ethConcentrationRisk)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${riskLevel.color}`}>
                          {riskLevel.level}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-8 bg-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-3">Understanding Exposure Analysis</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-indigo-800">
            <div>
              <h4 className="font-semibold mb-2">Market Weight</h4>
              <p>Company&apos;s market cap as percentage of total market cap across all tracked companies.</p>
              
              <h4 className="font-semibold mb-2 mt-3">ETH Weight</h4>
              <p>Company&apos;s ETH holdings as percentage of total ETH held by all tracked companies.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Concentration Risk</h4>
              <p>How much of the company&apos;s value comes from ETH holdings. Higher percentages indicate greater exposure to ETH price movements.</p>
              
              <h4 className="font-semibold mb-2 mt-3">Diversification Index</h4>
              <p>Measures how evenly distributed ETH holdings are across companies. Higher scores indicate better diversification.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
