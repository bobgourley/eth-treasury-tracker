'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface CompanyData {
  id: number
  name: string
  ticker: string | null
  ethHoldings: number
  stockPrice: number | null
  marketCap: bigint | null
}

export default function TreasuryCompaniesSummaryBlock() {
  const [companies, setCompanies] = useState<CompanyData[]>([])
  const [loading, setLoading] = useState(true)
  const [totalValue, setTotalValue] = useState(0)
  const [ethPrice, setEthPrice] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/companies')
        if (response.ok) {
          const data = await response.json()
          const activeCompanies = (data.companies || [])
            .filter((company: CompanyData) => company.ethHoldings > 0)
            .sort((a: CompanyData, b: CompanyData) => b.ethHoldings - a.ethHoldings)
            .slice(0, 5) // Top 5 companies
          
          setCompanies(activeCompanies)
          
          // Calculate total value
          const price = data.ethPrice || 3825.95
          setEthPrice(price)
          const total = activeCompanies.reduce((sum: number, company: CompanyData) => 
            sum + (company.ethHoldings * price), 0)
          setTotalValue(total)
        }
      } catch (error) {
        console.error('Failed to fetch company data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          <Link href="/treasury-companies" className="hover:text-blue-600 transition-colors">
            ETH Treasury Strategy
          </Link>
        </h3>
        <Link 
          href="/treasury-companies" 
          className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          View All →
        </Link>
      </div>

      {companies.length > 0 ? (
        <>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-700">Total Treasury Value</div>
            <div className="text-xl font-bold text-blue-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(totalValue)}
            </div>
          </div>

          <div className="space-y-3">
            {companies.map((company) => (
              <div key={company.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <div className="font-medium text-gray-900">
                    <Link 
                      href={`/companies/${company.ticker || company.id}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {company.name}
                    </Link>
                  </div>
                  {company.ticker && (
                    <div className="text-sm text-gray-500">
                      {company.ticker}
                      {company.stockPrice && (
                        <span className="ml-2">
                          ${company.stockPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(company.ethHoldings)} ETH
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      notation: 'compact',
                      maximumFractionDigits: 1
                    }).format(company.ethHoldings * ethPrice)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p>No company data available</p>
        </div>
      )}
    </div>
  )
}
