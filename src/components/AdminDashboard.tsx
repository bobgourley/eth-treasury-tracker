'use client'

import { useState } from 'react'
import { formatNumber, formatEth } from '@/lib/utils'

interface UpdateStatus {
  success: boolean
  message: string
  stats?: {
    companiesUpdated: number
    totalCompanies: number
    ethPrice: number
    totalEthHoldings: number
    totalEthValue: number
    totalMarketCap: number
    ethSupplyPercent: string
  }
  companies?: Array<{
    name: string
    ticker: string | null
    ethHoldings: number | null
    ethValue: number
    marketCap: number | null
    lastUpdated: string
  }>
  apiHealth?: {
    etherscan: boolean
    coingecko: boolean
    errors: string[]
  }
  timestamp: string
}

export default function AdminDashboard() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null)
  const [isUpdatingMarketCaps, setIsUpdatingMarketCaps] = useState(false)
  const [marketCapStatus, setMarketCapStatus] = useState<{
    success: boolean
    summary?: {
      totalCompanies: number
      companiesWithData: number
      companiesNeedingUpdate: number
      totalMarketCap: number
    }
    companies?: Array<{
      name: string
      ticker: string
      marketCapFormatted: string
      stockPrice: number
      lastUpdated: string
      dataAge: number
      needsUpdate: boolean
    }>
    message?: string
    error?: string
  } | null>(null)

  const triggerDataUpdate = async () => {
    setIsUpdating(true)
    setUpdateStatus(null)

    try {
      const response = await fetch('/api/admin/update-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      setUpdateStatus({
        success: result.success,
        message: result.message,
        timestamp: result.timestamp || new Date().toISOString()
      })
    } catch (error) {
      setUpdateStatus({
        success: false,
        message: 'Failed to trigger data update',
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const triggerStockUpdate = async () => {
    // Stock updates are now handled by the main update-metrics endpoint
    await triggerDataUpdate()
  }

  const updateMarketCaps = async () => {
    setIsUpdatingMarketCaps(true)
    setMarketCapStatus(null)

    try {
      const response = await fetch('/api/admin/update-market-caps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (result.success) {
        setMarketCapStatus(result)
        // Also refresh the status to show updated data
        setTimeout(() => checkMarketCapStatus(), 1000)
      } else {
        setMarketCapStatus({
          success: false,
          message: result.message || 'Failed to update market caps',
          error: result.error
        })
      }
    } catch (error) {
      console.error('Market cap update failed:', error)
      setMarketCapStatus({
        success: false,
        message: 'Failed to update market caps',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsUpdatingMarketCaps(false)
    }
  }

  const checkMarketCapStatus = async () => {
    try {
      const response = await fetch('/api/admin/update-market-caps', {
        method: 'GET'
      })

      const result = await response.json()
      setMarketCapStatus(result)
    } catch (error) {
      console.error('Failed to check market cap status:', error)
      setMarketCapStatus({
        success: false,
        message: 'Failed to check market cap status',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Admin Dashboard - Live Data Integration
        </h2>

        {/* Control Panel */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={triggerDataUpdate}
            disabled={isUpdating}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              isUpdating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isUpdating ? 'Updating Data...' : 'Trigger Data Update'}
          </button>

          <button
            onClick={triggerStockUpdate}
            disabled={isUpdating}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              isUpdating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {isUpdating ? 'Updating Stock Data...' : 'Force Stock Update'}
          </button>


        </div>

        {/* Market Cap Management */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Cap Management</h3>
          <p className="text-sm text-gray-600 mb-4">
            Update market cap data from Alpha Vantage API. Uses 18 of 25 daily requests (2 per company: stock price + market cap).
            <br />
            <span className="text-xs text-gray-500">Recommended: Update once per day to stay within rate limits and ensure fresh data.</span>
          </p>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={updateMarketCaps}
              disabled={isUpdatingMarketCaps}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                isUpdatingMarketCaps
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isUpdatingMarketCaps ? 'Updating Market Caps...' : 'Update Market Caps'}
            </button>
            
            <button
              onClick={checkMarketCapStatus}
              disabled={isUpdatingMarketCaps}
              className="px-6 py-3 rounded-lg font-semibold bg-gray-600 hover:bg-gray-700 text-white transition-colors"
            >
              Check Status
            </button>
          </div>
          
          {marketCapStatus && (
            <div className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-gray-600">Total Companies</p>
                  <p className="text-xl font-bold text-blue-600">{marketCapStatus.summary?.totalCompanies || 0}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-gray-600">With Market Cap</p>
                  <p className="text-xl font-bold text-green-600">{marketCapStatus.summary?.companiesWithData || 0}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-gray-600">Need Update</p>
                  <p className="text-xl font-bold text-orange-600">{marketCapStatus.summary?.companiesNeedingUpdate || 0}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-gray-600">Total Market Cap</p>
                  <p className="text-xl font-bold text-purple-600">
                    ${marketCapStatus.summary?.totalMarketCap ? (marketCapStatus.summary.totalMarketCap / 1000000000).toFixed(2) + 'B' : '0'}
                  </p>
                </div>
              </div>
              
              {marketCapStatus.companies && (
                <div className="bg-white rounded border max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left p-2 font-medium text-gray-600">Company</th>
                        <th className="text-left p-2 font-medium text-gray-600">Market Cap</th>
                        <th className="text-left p-2 font-medium text-gray-600">Stock Price</th>
                        <th className="text-left p-2 font-medium text-gray-600">Last Updated</th>
                        <th className="text-left p-2 font-medium text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketCapStatus.companies.map((company, index: number) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">
                            <div>
                              <div className="font-medium">{company.name}</div>
                              <div className="text-gray-500 text-xs">{company.ticker}</div>
                            </div>
                          </td>
                          <td className="p-2 font-mono">{company.marketCapFormatted}</td>
                          <td className="p-2 font-mono">${company.stockPrice?.toFixed(2) || '0.00'}</td>
                          <td className="p-2 text-xs">
                            {company.lastUpdated ? new Date(company.lastUpdated).toLocaleDateString() : 'Never'}
                            {company.dataAge && (
                              <div className="text-gray-500">({company.dataAge}h ago)</div>
                            )}
                          </td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              company.needsUpdate 
                                ? 'bg-orange-100 text-orange-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {company.needsUpdate ? 'Needs Update' : 'Current'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* API Health Status - Temporarily disabled for MVP deployment */}

        {/* Update Results */}
        {updateStatus && (
          <div className={`rounded-lg p-4 mb-6 ${
            updateStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-3 ${
              updateStatus.success ? 'text-green-800' : 'text-red-800'
            }`}>
              Update Results
            </h3>
            
            <p className={`mb-3 ${updateStatus.success ? 'text-green-700' : 'text-red-700'}`}>
              {updateStatus.message}
            </p>

            {updateStatus.stats && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-6">
                  <div className="bg-white p-3 rounded border">
                    <p className="font-medium text-gray-600">Total Companies</p>
                    <p className="text-2xl font-bold text-blue-600">{updateStatus.stats.totalCompanies}</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="font-medium text-gray-600">ETH Price</p>
                    <p className="text-2xl font-bold text-green-600">${formatNumber(updateStatus.stats.ethPrice)}</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="font-medium text-gray-600">Total ETH Holdings</p>
                    <p className="text-2xl font-bold text-purple-600">{formatEth(updateStatus.stats.totalEthHoldings)}</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="font-medium text-gray-600">Total ETH Value</p>
                    <p className="text-2xl font-bold text-orange-600">${formatNumber(updateStatus.stats.totalEthValue)}</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="font-medium text-gray-600">Total Market Cap</p>
                    <p className="text-2xl font-bold text-indigo-600">${formatNumber(updateStatus.stats.totalMarketCap)}</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="font-medium text-gray-600">ETH Supply %</p>
                    <p className="text-2xl font-bold text-red-600">{updateStatus.stats.ethSupplyPercent}</p>
                  </div>
                </div>

                {/* Company Details Table */}
                {updateStatus.companies && (
                  <div className="bg-white rounded border">
                    <h4 className="text-lg font-semibold p-4 border-b">Company Details</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-3 font-medium">Company</th>
                            <th className="text-left p-3 font-medium">Ticker</th>
                            <th className="text-right p-3 font-medium">ETH Holdings</th>
                            <th className="text-right p-3 font-medium">ETH Value</th>
                            <th className="text-right p-3 font-medium">Market Cap</th>
                            <th className="text-left p-3 font-medium">Last Updated</th>
                          </tr>
                        </thead>
                        <tbody>
                          {updateStatus.companies.map((company, index) => (
                            <tr key={index} className="border-t hover:bg-gray-50">
                              <td className="p-3 font-medium">{company.name}</td>
                              <td className="p-3 text-blue-600">{company.ticker || 'N/A'}</td>
                              <td className="p-3 text-right">{formatEth(company.ethHoldings || 0)}</td>
                              <td className="p-3 text-right text-green-600">${formatNumber(company.ethValue || 0)}</td>
                              <td className="p-3 text-right">{company.marketCap ? `$${formatNumber(company.marketCap)}` : 'N/A'}</td>
                              <td className="p-3 text-xs text-gray-500">{new Date(company.lastUpdated).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            <p className="text-xs text-gray-500 mt-3">
              Updated: {new Date(updateStatus.timestamp).toLocaleString()}
            </p>
          </div>
        )}

        {/* Last Check Status */}
        {/* System Status - Temporarily disabled for MVP deployment */}


      </div>
    </div>
  )
}
