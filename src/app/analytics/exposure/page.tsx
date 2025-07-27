'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import CompanyLink from '@/components/CompanyLink'
import { formatNumber, formatEth, formatPercentage } from '@/lib/utils'

interface ExposureData {
  id: number
  name: string
  ticker: string
  ethHoldings: number
  ethValue: number
  marketCap: string
  etcdWeight: number
  ethExposureWeight: number
  ecmcPercentage: number
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
  const [sortBy, setSortBy] = useState<'etcdWeight' | 'ethWeight' | 'ecmc' | 'name'>('etcdWeight')
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
      case 'etcdWeight':
        aValue = a.etcdWeight
        bValue = b.etcdWeight
        break
      case 'ethWeight':
        aValue = a.ethExposureWeight
        bValue = b.ethExposureWeight
        break
      case 'ecmc':
        aValue = a.ecmcPercentage
        bValue = b.ecmcPercentage
        break
      case 'name':
        aValue = a.name
        bValue = b.name
        break
      default:
        aValue = a.etcdWeight
        bValue = b.etcdWeight
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    const numA = Number(aValue)
    const numB = Number(bValue)
    return sortOrder === 'asc' ? numA - numB : numB - numA
  })

  const handleSort = (column: 'etcdWeight' | 'ethWeight' | 'ecmc' | 'name') => {
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
              <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                <Link href="/analytics/premium-discount" className="hover:text-blue-600 transition-colors">
                  Premium/Discount
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
                <Link href="/about" className="hover:text-blue-600 transition-colors">
                  About
                </Link>
                <span>•</span>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Dashboard
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
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-lg mb-8">
          <h1 className="text-3xl font-bold mb-4">Market Cap Weighted ETH Exposure</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{formatPercentage(data.averageEthExposure)}</div>
              <div className="text-sm opacity-90">Average ETH Exposure</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">Baselines</div>
              <div className="text-sm opacity-90">Market Analysis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatPercentage(data.topThreeConcentration)}</div>
              <div className="text-sm opacity-90">Median ETCD</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{data.diversificationIndex.toFixed(1)}/10</div>
              <div className="text-sm opacity-90">Diversification Index</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">${data.ethPrice.toLocaleString()}</div>
              <div className="text-sm opacity-90">ETH Price</div>
            </div>
          </div>
        </div>)}

        {/* Market Analysis Cards */}
        {data && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Market Concentration</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Market Cap:</span>
                  <span className="text-sm font-medium">{formatNumber(data.totalMarketCap)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total ETH Value:</span>
                  <span className="text-sm font-medium">{formatNumber(data.totalEthValue)}</span>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Baselines</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Median ECMC:</span>
                  <span className="text-sm font-medium">{formatPercentage(data.averageEthExposure)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Median ETCD:</span>
                  <span className="text-sm font-medium">{formatPercentage(data.topThreeConcentration)}</span>
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
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('etcdWeight')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>ETCD</span>
                      {sortBy === 'etcdWeight' && (
                        <span className="text-blue-500">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Company</span>
                      {sortBy === 'name' && (
                        <span className="text-blue-500">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ETH Holdings
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('ethWeight')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>ETH Weight</span>
                      {sortBy === 'ethWeight' && (
                        <span className="text-blue-500">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('ecmc')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>ECMC</span>
                      {sortBy === 'ecmc' && (
                        <span className="text-blue-500">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCompanies?.map((company) => {
                  return (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatPercentage(company.etcdWeight)}
                            </div>
                          </div>
                        </div>
                      </td>
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
                        {formatPercentage(company.ethExposureWeight)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatPercentage(company.ecmcPercentage)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>



        {/* Explanatory Text */}
        <div className="mt-12 bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Understanding the Metrics</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-blue-600 mb-3">ECMC - ETH Component of Market Cap</h3>
              <p className="text-gray-700 leading-relaxed">
                ECMC measures what percentage of a company&apos;s market capitalization is represented by their ETH holdings. 
                A higher ECMC indicates that ETH holdings make up a larger portion of the company&apos;s total value, 
                showing how much the company&apos;s stock price is tied to ETH performance.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-purple-600 mb-3">ETCD - ETH Treasury Company Dominance</h3>
              <p className="text-gray-700 leading-relaxed">
                ETCD shows each company&apos;s relative size within the ETH treasury company ecosystem. 
                This metric helps identify which companies have the most influence in the space and 
                how market dominance is distributed among ETH-holding public companies.
              </p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Baselines</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div><strong>Median ECMC:</strong> The middle value of ETH components across all companies</div>
              <div><strong>Median ETCD:</strong> The middle value of company dominance in the ETH treasury space</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
