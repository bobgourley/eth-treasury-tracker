import { memo } from 'react'
import Link from 'next/link'
import { StaticCompanyData } from '@/lib/staticDataFetcher'

interface StaticTreasuryCompaniesSummaryBlockProps {
  companies: StaticCompanyData[]
  ethPrice: number
}

function StaticTreasuryCompaniesSummaryBlock({ companies, ethPrice }: StaticTreasuryCompaniesSummaryBlockProps) {
  // Calculate total treasury value
  const totalTreasuryValue = companies.reduce((sum, company) => sum + ((company.ethHoldings || 0) * ethPrice), 0)

  // Get top 5 companies for display
  const topCompanies = companies.slice(0, 5)

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">ETH Treasury Strategy</h2>
        <Link 
          href="/treasury-companies" 
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All →
        </Link>
      </div>

      {/* Total Value */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-700 mb-1">Total Treasury Value</p>
        <p className="text-2xl font-bold text-blue-900">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(totalTreasuryValue)}
        </p>
      </div>

      {/* Companies List */}
      <div className="space-y-4">
        {topCompanies.map((company) => (
          <div key={company.id} className="flex justify-between items-center">
            <div className="flex-1">
              <div className="font-medium text-gray-900">{company.name}</div>
              <div className="text-sm text-gray-500">{company.ticker}</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">
                {new Intl.NumberFormat('en-US').format(company.ethHoldings || 0)} ETH
              </div>
              <div className="text-sm text-gray-500">
                {company.marketCap && Number(company.marketCap) > 0 
                  ? `$${(Number(company.marketCap) / 1000000000).toFixed(1)}B`
                  : `$${(company.totalValue / 1000000).toFixed(0)}M`
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-400 text-center mt-4">
        <span className="text-green-500">• Static Data</span>
      </div>
    </div>
  )
}

export default memo(StaticTreasuryCompaniesSummaryBlock)
