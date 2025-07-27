'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

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

  const formatNumber = (num: number) => {
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`
    }
    return `$${num.toLocaleString()}`
  }

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
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-bold text-gray-900">Loading...</h1>
              <div className="flex items-center space-x-3 text-xs text-gray-500">
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-bold text-gray-900">Company Not Found</h1>
              <div className="flex items-center space-x-3 text-xs text-gray-500">
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-600 text-lg font-semibold">Error: {error}</div>
            <Link 
              href="/" 
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
                <span>•</span>
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
              </div>
              <h1 className="text-4xl font-bold text-gray-900">{company.name}</h1>
              <p className="text-xl text-gray-600">{company.ticker}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                ${company.stockPrice.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Stock Price</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Market Cap */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Cap</h3>
            <div className="text-2xl font-bold text-blue-600">{company.marketCap}</div>
          </div>

          {/* ETH Holdings */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ETH Holdings</h3>
            <div className="text-2xl font-bold text-purple-600">{company.ethHoldingsFormatted}</div>
            <div className="text-sm text-gray-500 mt-1">{company.ethValueFormatted}</div>
          </div>

          {/* ETH Exposure */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ETH Exposure</h3>
            <div className="text-2xl font-bold text-green-600">{formatPercentage(company.ecmcPercentage)}</div>
            <div className="text-sm text-gray-500 mt-1">of Market Cap</div>
          </div>

          {/* Premium/Discount */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium/Discount</h3>
            <div className={`text-2xl font-bold ${getPremiumDiscountColor(company.premiumDiscount)}`}>
              {company.premiumDiscount > 0 ? '+' : ''}{formatPercentage(company.premiumDiscount)}
            </div>
            <div className="text-sm text-gray-500 mt-1">vs ETH Value</div>
          </div>
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
                  <span className="font-semibold">{company.ticker}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current ETH Price</span>
                  <span className="font-semibold">${company.ethPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ETH Holdings</span>
                  <span className="font-semibold">{company.ethHoldingsFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Holdings Value</span>
                  <span className="font-semibold">{company.ethValueFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-semibold text-sm">
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
      </main>
    </div>
  )
}
