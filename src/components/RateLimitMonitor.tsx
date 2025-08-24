'use client'

import { useState, useEffect } from 'react'

interface ApiUsageStats {
  apiName: string
  displayName: string
  dailyUsage: number
  dailyLimit: number
  usagePercent: number
  successRate: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  recommendation: string
  lastCall?: string
  recentErrors: string[]
}

interface RateLimitData {
  success: boolean
  timestamp: string
  systemHealth: 'healthy' | 'warning' | 'critical'
  systemMessage: string
  apis: ApiUsageStats[]
  summary: {
    totalApis: number
    criticalApis: number
    highRiskApis: number
    averageSuccessRate: number
  }
}

export default function RateLimitMonitor() {
  const [data, setData] = useState<RateLimitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchRateLimitData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/rate-limits')
      const result = await response.json()
      
      if (result.success) {
        setData(result)
        setError(null)
        setLastUpdated(new Date())
      } else {
        setError(result.error || 'Failed to fetch rate limit data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRateLimitData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRateLimitData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'warning': return 'text-orange-600 bg-orange-100'
      default: return 'text-green-600 bg-green-100'
    }
  }

  if (loading && !data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-red-600 mb-4">
          <h3 className="text-lg font-semibold">Error Loading Rate Limits</h3>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={fetchRateLimitData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">API Rate Limit Monitor</h2>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSystemHealthColor(data.systemHealth)}`}>
              {data.systemHealth.toUpperCase()}
            </div>
            <button
              onClick={fetchRateLimitData}
              disabled={loading}
              className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <p className="text-gray-600 mb-4">{data.systemMessage}</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{data.summary.totalApis}</div>
            <div className="text-sm text-gray-600">Total APIs</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{data.summary.criticalApis}</div>
            <div className="text-sm text-red-600">Critical Risk</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{data.summary.highRiskApis}</div>
            <div className="text-sm text-orange-600">High Risk</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{data.summary.averageSuccessRate}%</div>
            <div className="text-sm text-green-600">Avg Success Rate</div>
          </div>
        </div>

        {lastUpdated && (
          <p className="text-xs text-gray-500">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        )}
      </div>

      {/* Individual API Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API Usage Details</h3>
        
        <div className="space-y-4">
          {data.apis.map((api) => (
            <div key={api.apiName} className={`border rounded-lg p-4 ${getRiskColor(api.riskLevel)}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{api.displayName}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {api.usagePercent}% used
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(api.riskLevel)}`}>
                    {api.riskLevel.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <div className="text-sm text-gray-600">Daily Usage</div>
                  <div className="font-medium">
                    {api.dailyUsage.toLocaleString()} / {api.dailyLimit.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                  <div className="font-medium">{api.successRate}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Last Call</div>
                  <div className="font-medium text-xs">
                    {api.lastCall ? new Date(api.lastCall).toLocaleString() : 'Never'}
                  </div>
                </div>
              </div>

              {/* Usage Progress Bar */}
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      api.riskLevel === 'critical' ? 'bg-red-500' :
                      api.riskLevel === 'high' ? 'bg-orange-500' :
                      api.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(api.usagePercent, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-sm">{api.recommendation}</div>

              {api.recentErrors.length > 0 && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                  <div className="text-sm font-medium text-red-800 mb-1">Recent Errors:</div>
                  <ul className="text-xs text-red-700 space-y-1">
                    {api.recentErrors.map((error, index) => (
                      <li key={index} className="truncate">• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
