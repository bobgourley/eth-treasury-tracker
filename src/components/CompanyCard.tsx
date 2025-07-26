'use client'

import { useState } from 'react'
import { Company } from '@/types/company'
import { formatNumber, formatEth, formatPercentage, formatShares } from '@/lib/utils'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface CompanyCardProps {
  company: Company & {
    marketCap?: string
    sharesOutstanding?: string
    stockPrice?: number
  }
  rank: number
  ethPrice?: number
}

export default function CompanyCard({ company, rank, ethPrice }: CompanyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getYahooFinanceUrl = (ticker: string) => {
    return `https://finance.yahoo.com/quote/${ticker}`
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      {/* Summary Row - Always Visible */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
            {rank}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-gray-900">{company.name}</h3>
              {company.ticker && (
                <a
                  href={getYahooFinanceUrl(company.ticker)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  ({company.ticker})
                </a>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-xl font-bold text-blue-600">
              {formatEth(company.ethHoldings)}
            </p>
            <p className="text-xs text-gray-500">ETH Holdings</p>
          </div>
          
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">
              {company.ethHoldings && ethPrice ? formatNumber(company.ethHoldings * ethPrice) : 'N/A'}
            </p>
            <p className="text-xs text-gray-500">ETH Value</p>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            {isExpanded ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details - Collapsible */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="pt-4">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm mb-4">
              <div>
                <p className="text-gray-600">Stock Price</p>
                <p className="font-semibold text-green-600">
                  {company.stockPrice ? `$${company.stockPrice.toFixed(2)}` : 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600">Shares Outstanding</p>
                <p className="font-semibold">
                  {company.sharesOutstanding ? formatShares(BigInt(company.sharesOutstanding)) : 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600">Market Cap</p>
                <p className="font-semibold">
                  {company.marketCap ? formatNumber(BigInt(company.marketCap)) : 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600">ETH Value</p>
                <p className="font-semibold text-blue-600">
                  {company.ethHoldings ? formatNumber(company.ethHoldings * 3680) : 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600">ETH per Share</p>
                <p className="font-semibold">
                  {company.ethPerShare ? company.ethPerShare.toFixed(6) : 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600">Staking Yield</p>
                <p className="font-semibold">
                  {formatPercentage(company.stakingYield)}
                </p>
              </div>
            </div>

            {/* Detailed Information */}
            {(company.website || company.yieldSources || company.capitalStructure || company.fundingSources) && (
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {company.website && (
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Website</p>
                      <a 
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                  
                  {company.yieldSources && (
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Yield Sources</p>
                      <p className="text-gray-800">{company.yieldSources}</p>
                    </div>
                  )}
                  
                  {company.capitalStructure && (
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Capital Structure</p>
                      <p className="text-gray-800">{company.capitalStructure}</p>
                    </div>
                  )}
                  
                  {company.fundingSources && (
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Funding Sources</p>
                      <p className="text-gray-800">{company.fundingSources}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 text-xs text-gray-500">
              Last updated: {new Date(company.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
