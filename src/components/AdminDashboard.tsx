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
    ethSupplyPercent: string
  }
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
  const [lastCheck, setLastCheck] = useState<any>(null)

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

  const checkUpdateStatus = async () => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
            onClick={checkUpdateStatus}
            className="px-6 py-3 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors"
          >
            Check Status
          </button>
        </div>

        {/* API Health Status */}
        {(updateStatus?.apiHealth || lastCheck?.apiHealth) && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3">API Health Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    (updateStatus?.apiHealth?.etherscan || lastCheck?.apiHealth?.etherscan)
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`}
                />
                <span>Etherscan API</span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    (updateStatus?.apiHealth?.coingecko || lastCheck?.apiHealth?.coingecko)
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`}
                />
                <span>CoinGecko API</span>
              </div>
            </div>
            
            {/* API Errors */}
            {(updateStatus?.apiHealth?.errors?.length || lastCheck?.apiHealth?.errors?.length) && (
              <div className="mt-3">
                <p className="text-sm font-medium text-red-600 mb-2">API Issues:</p>
                <ul className="text-sm text-red-600 space-y-1">
                  {(updateStatus?.apiHealth?.errors || lastCheck?.apiHealth?.errors || []).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">Companies Updated</p>
                  <p className="text-lg">{updateStatus.stats.companiesUpdated}/{updateStatus.stats.totalCompanies}</p>
                </div>
                <div>
                  <p className="font-medium">ETH Price</p>
                  <p className="text-lg">${formatNumber(updateStatus.stats.ethPrice)}</p>
                </div>
                <div>
                  <p className="font-medium">Total ETH Holdings</p>
                  <p className="text-lg">{formatEth(updateStatus.stats.totalEthHoldings)}</p>
                </div>
                <div>
                  <p className="font-medium">Total ETH Value</p>
                  <p className="text-lg">${formatNumber(updateStatus.stats.totalEthValue)}</p>
                </div>
                <div>
                  <p className="font-medium">ETH Supply %</p>
                  <p className="text-lg">{updateStatus.stats.ethSupplyPercent}</p>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-3">
              Updated: {new Date(updateStatus.timestamp).toLocaleString()}
            </p>
          </div>
        )}

        {/* Last Check Status */}
        {lastCheck && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">System Status</h3>
            
            {lastCheck.lastUpdate && (
              <p className="text-blue-700 mb-3">
                Last Update: {new Date(lastCheck.lastUpdate).toLocaleString()}
              </p>
            )}

            {lastCheck.metrics && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">Total Companies</p>
                  <p className="text-lg">{lastCheck.metrics.totalCompanies}</p>
                </div>
                <div>
                  <p className="font-medium">ETH Price</p>
                  <p className="text-lg">${formatNumber(lastCheck.metrics.ethPrice || 0)}</p>
                </div>
                <div>
                  <p className="font-medium">Total ETH Holdings</p>
                  <p className="text-lg">{formatEth(lastCheck.metrics.totalEthHoldings)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Setup Instructions</h3>
          <div className="text-yellow-700 text-sm space-y-2">
            <p>To enable live data integration:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Copy <code>env.example</code> to <code>.env</code></li>
              <li>Get a free API key from <a href="https://etherscan.io/apis" className="underline" target="_blank">Etherscan</a></li>
              <li>Get a free API key from <a href="https://coingecko.com/en/api/pricing" className="underline" target="_blank">CoinGecko</a></li>
              <li>Add your API keys to the <code>.env</code> file</li>
              <li>Restart the development server</li>
              <li>Click "Trigger Data Update" to test the integration</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
