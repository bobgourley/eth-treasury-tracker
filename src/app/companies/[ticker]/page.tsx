'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import FuturisticLayout from '../../../components/FuturisticLayout'
import FuturisticCard, { MetricDisplay, DataList } from '../../../components/FuturisticCard'
import { FuturisticBadge } from '../../../components/FuturisticUI'
import SECFilings from '../../../components/SECFilings'
import CompanyNews from '../../../components/CompanyNews'
import styles from '../../../styles/futuristic.module.css'

interface CompanyProfile {
  id: number
  name: string
  ticker: string
  description: string
  stockPrice: number
  marketCap: string
  marketCapNumeric: number
  ethHoldings: number
  ethValue: number
  ethPrice: number
  ecmcPercentage: number
  premiumDiscount: number
  fairValue: number
  yahooFinanceUrl: string
  secFilingsUrl: string
  companyWebsite: string
  lastUpdated: string
  ethHoldingsFormatted: string
  ethValueFormatted: string
  ethWeight?: number
  sector: string
  headquarters: string
  website: string
  riskLevel: string
}

export default function CompanyProfilePage() {
  const params = useParams()
  const ticker = params.ticker as string
  const [company, setCompany] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(`/api/companies/${ticker}`)
        if (!response.ok) {
          throw new Error('Company not found')
        }
        const data = await response.json()
        setCompany(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (ticker) {
      fetchCompanyData()
    }
  }, [ticker])

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`
  }

  const getPremiumDiscountColor = (value: number) => {
    if (value > 5) return 'text-green-600'
    if (value < -5) return 'text-red-600'
    return 'text-gray-600'
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <FuturisticLayout title="Loading Company..." showLiveIndicator={false}>
        <FuturisticCard title="Loading" icon="⏳">
          <div className="text-center">
            <p>Loading company data...</p>
          </div>
        </FuturisticCard>
      </FuturisticLayout>
    )
  }

  if (error || !company) {
    return (
      <FuturisticLayout title="Company Not Found" showLiveIndicator={false}>
        <FuturisticCard title="Error" icon="❌" variant="warning">
          <div className="text-center">
            <p>Error: {error}</p>
            <Link href="/">
              <FuturisticBadge variant="info">Back to Dashboard</FuturisticBadge>
            </Link>
          </div>
        </FuturisticCard>
      </FuturisticLayout>
    )
  }

  return (
    <FuturisticLayout title={`${company.name} (${company.ticker})`} showLiveIndicator={true}>
      {/* Company Overview Cards */}
      <div className={styles.cardGrid}>
        {/* Stock Price */}
        <FuturisticCard title="Stock Price" icon="💰">
          <MetricDisplay 
            value={`$${company.stockPrice.toFixed(2)}`} 
            label="Current Price" 
          />
        </FuturisticCard>

        {/* Market Cap */}
        <FuturisticCard title="Market Cap" icon="📊">
          <MetricDisplay 
            value={company.marketCap} 
            label="Total Market Value" 
          />
        </FuturisticCard>

        {/* ETH Holdings */}
        <FuturisticCard title="ETH Holdings" icon="Ξ">
          <MetricDisplay 
            value={company.ethHoldingsFormatted} 
            label="Total ETH" 
          />
          <MetricDisplay 
            value={company.ethValueFormatted} 
            label="USD Value" 
          />
        </FuturisticCard>

        {/* ETH Exposure */}
        <FuturisticCard title="ETH Exposure" icon="📈">
          <MetricDisplay 
            value={formatPercentage(company.ecmcPercentage)} 
            label="of Market Cap" 
          />
        </FuturisticCard>

        {/* Premium/Discount */}
        <FuturisticCard title="Premium/Discount" icon="⚖️">
          <MetricDisplay 
            value={`${company.premiumDiscount > 0 ? '+' : ''}${formatPercentage(company.premiumDiscount)}`} 
            label="vs ETH Value" 
          />
        </FuturisticCard>
      </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Company Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Company Summary */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Overview</h2>
              <div className="prose text-gray-700">
                <p>{company.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Headquarters</h4>
                    <p className="text-gray-600">{company.headquarters}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Treasury Strategy</h4>
                    <p className="text-gray-600">Strategic ETH Holdings</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ETH Analytics */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">ETH Treasury Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-3">ETH Component of Market Cap (ECMC)</h4>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatPercentage(company.ecmcPercentage)}
                  </div>
                  <p className="text-blue-800 text-sm">
                    Percentage of company&apos;s market cap represented by ETH holdings
                  </p>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h4 className="font-bold text-purple-900 mb-3">ETH Weight</h4>
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {formatPercentage(company.ethWeight || 0)}
                  </div>
                  <p className="text-purple-800 text-sm">
                    Share of total ETH holdings across all tracked companies
                  </p>
                </div>
              </div>

              <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Fair Value Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Current Market Cap</div>
                    <div className="text-lg font-bold text-gray-900">{company.marketCap}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">ETH Holdings Value</div>
                    <div className="text-lg font-bold text-purple-600">{company.ethValueFormatted}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Premium/Discount</div>
                    <div className={`text-lg font-bold ${getPremiumDiscountColor(company.premiumDiscount)}`}>
                      {company.premiumDiscount > 0 ? '+' : ''}{formatPercentage(company.premiumDiscount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - External Links & Info */}
          <div className="space-y-8">
            {/* External Links */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">External Resources</h2>
              <div className="space-y-4">
                <a
                  href={company.yahooFinanceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📊 View on Yahoo Finance
                </a>
                
                <a
                  href={company.secFilingsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-600 text-white text-center py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  📄 SEC Filings (EDGAR)
                </a>
                
                <a
                  href={company.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gray-600 text-white text-center py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  🌐 Company Website
                </a>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ticker Symbol</span>
                  <span className="font-semibold text-gray-900">{company.ticker}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current ETH Price</span>
                  <span className="font-semibold text-gray-900">${Math.round(company.ethPrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ETH Holdings</span>
                  <span className="font-semibold text-gray-900">{company.ethHoldingsFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Holdings Value</span>
                  <span className="font-semibold text-gray-900">{company.ethValueFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {new Date(company.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Related Analytics */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Related Analytics</h2>
              <div className="space-y-3">
                <Link
                  href="/analytics/premium-discount"
                  className="block text-blue-600 hover:text-blue-800 transition-colors"
                >
                  → Premium/Discount Analysis
                </Link>
                <Link
                  href="/analytics/exposure"
                  className="block text-blue-600 hover:text-blue-800 transition-colors"
                >
                  → ETH Exposure Analytics
                </Link>
                <Link
                  href="/analytics/charts"
                  className="block text-blue-600 hover:text-blue-800 transition-colors"
                >
                  → Interactive Charts
                </Link>
                <Link
                  href="/"
                  className="block text-blue-600 hover:text-blue-800 transition-colors"
                >
                  → Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

      {/* Company Details */}
      <FuturisticCard title="Company Overview" icon="🏢" size="large">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <MetricDisplay 
              value={company.sector} 
              label="Sector" 
            />
            <MetricDisplay 
              value={company.headquarters} 
              label="Headquarters" 
            />
          </div>
          <div>
            <MetricDisplay 
              value={company.riskLevel} 
              label="Risk Level" 
            />
            <div style={{ marginTop: '1rem' }}>
              <a href={company.website} target="_blank" rel="noopener noreferrer">
                <FuturisticBadge variant="info">Company Website →</FuturisticBadge>
              </a>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{company.description}</p>
        </div>
      </FuturisticCard>

      {/* SEC Filings and News */}
      <div className={styles.cardGrid}>
        <div style={{ gridColumn: 'span 1' }}>
          <SECFilings ticker={company.ticker} />
        </div>
        <div style={{ gridColumn: 'span 1' }}>
          <CompanyNews ticker={company.ticker} />
        </div>
      </div>
    </FuturisticLayout>
  )
}
