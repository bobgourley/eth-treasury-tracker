'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import CompanyLink from '@/components/CompanyLink'
import FuturisticLayout from '@/components/FuturisticLayout'
import FuturisticCard from '@/components/FuturisticCard'
import { formatNumber, formatEth, formatPercentage } from '@/lib/utils'
import styles from '@/styles/futuristic.module.css'

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
      <FuturisticLayout title="Market Cap Weighted ETH Exposure" showLiveIndicator={true}>
        <FuturisticCard title="Loading..." icon="⏳">
          <div className="text-center">
            <p>Loading exposure analysis...</p>
          </div>
        </FuturisticCard>
      </FuturisticLayout>
    )
  }

  if (error) {
    return (
      <FuturisticLayout title="Market Cap Weighted ETH Exposure" showLiveIndicator={true}>
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
    <FuturisticLayout title="Market Cap Weighted ETH Exposure" showLiveIndicator={true}>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <span>📊</span>
          <span>Market Cap Weighted ETH Exposure</span>
        </div>
        <p className={styles.pageDescription}>
          Market cap weighted analysis of ETH exposure and concentration risk across treasury companies
        </p>
      </div>

      <div className={styles.cardGrid}>
        {/* Summary Stats */}
        {data && (
          <FuturisticCard title="Market Overview" icon="📈" size="large">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">{formatPercentage(data.averageEthExposure)}</div>
                <div className="text-gray-400 text-sm">Average ETH Exposure</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">Baselines</div>
                <div className="text-gray-400 text-sm">Market Analysis</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{formatPercentage(data.topThreeConcentration)}</div>
                <div className="text-gray-400 text-sm">Median ETCD</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400">{data.diversificationIndex.toFixed(1)}/10</div>
                <div className="text-gray-400 text-sm">Diversification Index</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-400">${data.ethPrice.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">ETH Price</div>
              </div>
            </div>
          </FuturisticCard>
        )}

        {/* Market Analysis Cards */}
        {data && (
          <>
            <FuturisticCard title="Market Concentration" icon="🎯">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Market Cap:</span>
                  <span className="text-white font-medium">{formatNumber(data.totalMarketCap)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total ETH Value:</span>
                  <span className="text-white font-medium">{formatNumber(data.totalEthValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ETH/Market Ratio:</span>
                  <span className="text-white font-medium">
                    {formatPercentage((data.totalEthValue / data.totalMarketCap) * 100)}
                  </span>
                </div>
              </div>
            </FuturisticCard>

            <FuturisticCard title="Baselines" icon="📏">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Median ECMC:</span>
                  <span className="text-white font-medium">{formatPercentage(data.averageEthExposure)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Median ETCD:</span>
                  <span className="text-white font-medium">{formatPercentage(data.topThreeConcentration)}</span>
                </div>
              </div>
            </FuturisticCard>

            <FuturisticCard title="Diversification" icon="🌐">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Companies Tracked:</span>
                  <span className="text-white font-medium">{data.companies.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Diversification Score:</span>
                  <span className="text-white font-medium">{data.diversificationIndex.toFixed(1)}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current ETH Price:</span>
                  <span className="text-white font-medium">${data.ethPrice.toLocaleString()}</span>
                </div>
              </div>
            </FuturisticCard>
          </>
        )}

        {/* Exposure Analysis Table */}
        <FuturisticCard title="Company Exposure Analysis" icon="🏢" size="large">
          <p className="text-gray-400 text-sm mb-4">
            Market cap weighted analysis of ETH exposure and concentration risk
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-400"
                    onClick={() => handleSort('etcdWeight')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>ETCD</span>
                      {sortBy === 'etcdWeight' && (
                        <span className="text-blue-400">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-400"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Company</span>
                      {sortBy === 'name' && (
                        <span className="text-blue-400">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    ETH Holdings
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-400"
                    onClick={() => handleSort('ethWeight')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>ETH Weight</span>
                      {sortBy === 'ethWeight' && (
                        <span className="text-blue-400">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-400"
                    onClick={() => handleSort('ecmc')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>ECMC</span>
                      {sortBy === 'ecmc' && (
                        <span className="text-blue-400">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sortedCompanies?.map((company) => {
                  return (
                    <tr key={company.id} className="hover:bg-gray-800/50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-400">
                          {formatPercentage(company.etcdWeight)}
                        </div>
                      </td>
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
                        {formatPercentage(company.ethExposureWeight)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-300">
                        {formatPercentage(company.ecmcPercentage)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </FuturisticCard>



        {/* Explanatory Text */}
        <FuturisticCard title="Understanding the Metrics" icon="📚" size="large">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">ECMC - ETH Component of Market Cap</h3>
              <p className="text-gray-300 leading-relaxed text-sm">
                ECMC measures what percentage of a company's market capitalization is represented by their ETH holdings. 
                A higher ECMC indicates that ETH holdings make up a larger portion of the company&apos;s total value, 
                showing how much the company&apos;s stock price is tied to ETH performance.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-3">ETCD - ETH Treasury Company Dominance</h3>
              <p className="text-gray-300 leading-relaxed text-sm">
                ETCD shows each company&apos;s relative size within the ETH treasury company ecosystem. 
                This metric helps identify which companies have the most influence in the space and 
                how market dominance is distributed among ETH-holding public companies.
              </p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-900/30 rounded-lg border border-blue-700/50">
            <h4 className="font-semibold text-blue-400 mb-2">Baselines</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div><strong className="text-blue-400">Median ECMC:</strong> The middle value of ETH components across all companies</div>
              <div><strong className="text-purple-400">Median ETCD:</strong> The middle value of company dominance in the ETH treasury space</div>
            </div>
          </div>
        </FuturisticCard>
      </div>
    </FuturisticLayout>
  )
}
