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
  const [lastCheck, setLastCheck] = useState<unknown>(null)

  const triggerDataUpdate = async () => {
    setIsUpdating(true)
    setUpdateStatus(null)

    try {
      const response = await fetch('/api/update-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      setUpdateStatus(result)
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
    setIsUpdating(true)
    setUpdateStatus(null)

    try {
      const response = await fetch('/api/update-data?forceStockUpdate=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      setUpdateStatus(result)
    } catch (error) {
      setUpdateStatus({
        success: false,
        message: 'Failed to trigger stock data update',
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateData = async () => {
    try {
      const response = await fetch('/api/update-data')
      const result = await response.json()
      setLastCheck(result)
    } catch (error) {
      console.error('Failed to check update status:', error)
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

          <button
            onClick={handleUpdateData}
            className="px-6 py-3 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors"
          >
            Check Status
          </button>
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
                {(updateStatus as any).companies && (
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
                          {(updateStatus as any).companies.map((company: any, index: number) => (
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
