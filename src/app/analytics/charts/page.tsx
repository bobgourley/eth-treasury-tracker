'use client'

import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { FALLBACK_ETH_PRICE } from '@/lib/constants'
import Link from 'next/link'
import CompanyLink from '@/components/CompanyLink'
import FuturisticLayout from '@/components/FuturisticLayout'
import FuturisticCard from '@/components/FuturisticCard'
import styles from '@/styles/futuristic.module.css'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface CompanyData {
  id: number
  name: string
  ticker: string
  ethHoldings: number
  ethValue: number
  marketCap: string
}

interface ChartsData {
  companies: CompanyData[]
  totalEthHoldings: number
  totalEthValue: number
  ethPrice: number
}

export default function ChartsPage() {
  const [data, setData] = useState<ChartsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both companies and metrics data to get live ETH price
        const [companiesResponse, metricsResponse] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/metrics')
        ])
        
        if (!companiesResponse.ok || !metricsResponse.ok) {
          throw new Error('Failed to fetch data')
        }
        
        const companiesData = await companiesResponse.json()
        const metricsData = await metricsResponse.json()
        
        // Extract companies array from API response
        const companies = companiesData.companies || []
        
        // Calculate totals using live ETH price
        const totalEthHoldings = companies.reduce((sum: number, company: CompanyData) => 
          sum + (company.ethHoldings || 0), 0)
        const ethPrice = metricsData.ethPrice || companiesData.ethPrice || FALLBACK_ETH_PRICE // Use ETH price from either API
        const totalEthValue = totalEthHoldings * ethPrice

        setData({
          companies: companies,
          totalEthHoldings,
          totalEthValue,
          ethPrice
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatEth = (eth: number) => {
    if (eth >= 1000) {
      return `${Math.round(eth / 1000).toLocaleString()}k ETH`
    }
    return `${Math.round(eth).toLocaleString()} ETH`
  }

  const formatNumber = (num: number) => {
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`
    }
    return `$${num.toLocaleString()}`
  }

  // Generate colors for the chart
  const generateColors = (count: number) => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
      '#14B8A6', '#F43F5E', '#8B5A2B', '#059669', '#DC2626'
    ]
    return colors.slice(0, count)
  }

  if (loading) {
    return (
      <FuturisticLayout title="ETH Holdings Charts" showLiveIndicator={true}>
        <div className={styles.cardGrid}>
          <FuturisticCard title="Loading" icon="⟳" size="full" loading={true}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
              <p style={{ color: 'var(--text-secondary)' }}>Loading analytics data...</p>
            </div>
          </FuturisticCard>
        </div>
      </FuturisticLayout>
    )
  }

  if (error) {
    return (
      <FuturisticLayout title="ETH Holdings Charts" showLiveIndicator={true}>
        <div className={styles.cardGrid}>
          <FuturisticCard title="Error" icon="❌" variant="warning" size="full">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '1rem' }}>Error: {error}</div>
              <button 
                onClick={() => window.location.reload()} 
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--accent-cyan)',
                  color: 'var(--bg-primary)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Retry
              </button>
            </div>
          </FuturisticCard>
        </div>
      </FuturisticLayout>
    )
  }

  if (!data) return null

  // Prepare chart data
  const sortedCompanies = [...data.companies]
    .filter(company => company.ethHoldings > 0)
    .sort((a, b) => b.ethHoldings - a.ethHoldings)

  const chartData = {
    labels: sortedCompanies.map(company => company.name),
    datasets: [
      {
        data: sortedCompanies.map(company => company.ethHoldings),
        backgroundColor: generateColors(sortedCompanies.length),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  }

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const company = sortedCompanies[context.dataIndex]
            const percentage = ((company.ethHoldings / data.totalEthHoldings) * 100).toFixed(1)
            return [
              `${company.name} (${company.ticker})`,
              `${formatEth(company.ethHoldings)}`,
              `${percentage}% of total holdings`,
              `Value: ${formatNumber(company.ethHoldings * data.ethPrice)}`
            ]
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    cutout: '60%',
  }

  return (
    <FuturisticLayout title="ETH Holdings Charts" showLiveIndicator={true}>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-lg mb-8">
          <h2 className="text-3xl font-bold mb-4">ETH Holdings Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{formatEth(data.totalEthHoldings)}</div>
              <div className="text-sm opacity-90">Total ETH Holdings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatNumber(data.totalEthValue)}</div>
              <div className="text-sm opacity-90">Total ETH Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{sortedCompanies.length}</div>
              <div className="text-sm opacity-90">Companies with ETH</div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Market Share Distribution</h3>
          <div className="relative h-96">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Top Holdings Table */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Top ETH Holdings</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ETH Holdings
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Share
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ETH Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCompanies.slice(0, 10).map((company, index) => {
                  const percentage = ((company.ethHoldings / data.totalEthHoldings) * 100)
                  return (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            <CompanyLink 
                              ticker={company.ticker} 
                              name={company.name}
                            />
                          </div>
                          <div className="text-sm text-gray-500">{company.ticker}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatEth(company.ethHoldings)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {percentage.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatNumber(company.ethHoldings * data.ethPrice)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </FuturisticLayout>
  )
}
