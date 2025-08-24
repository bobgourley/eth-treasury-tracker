import { NextResponse } from 'next/server'
import { rateLimiter } from '@/lib/rateLimiter'

/**
 * GET /api/admin/rate-limits
 * Returns current API usage statistics and rate limit status
 */
export async function GET() {
  try {
    const allStats = rateLimiter.getAllUsageStats()
    
    // Calculate risk levels and recommendations
    const apiStatus = Object.entries(allStats).map(([apiName, stats]) => {
      const usagePercent = stats.dailyLimit > 0 ? (stats.dailyUsage / stats.dailyLimit) * 100 : 0
      
      let riskLevel: 'low' | 'medium' | 'high' | 'critical'
      let recommendation: string
      
      if (usagePercent >= 90) {
        riskLevel = 'critical'
        recommendation = 'URGENT: API limit almost reached. Suspend non-critical calls.'
      } else if (usagePercent >= 70) {
        riskLevel = 'high'
        recommendation = 'High usage detected. Reduce update frequency.'
      } else if (usagePercent >= 50) {
        riskLevel = 'medium'
        recommendation = 'Monitor usage closely. Consider optimizing calls.'
      } else {
        riskLevel = 'low'
        recommendation = 'Usage within safe limits.'
      }
      
      return {
        apiName,
        displayName: getApiDisplayName(apiName),
        dailyUsage: stats.dailyUsage,
        dailyLimit: stats.dailyLimit,
        usagePercent: Math.round(usagePercent * 10) / 10,
        successRate: Math.round(stats.successRate * 10) / 10,
        riskLevel,
        recommendation,
        lastCall: stats.lastCall?.toISOString(),
        recentErrors: stats.recentErrors.slice(0, 3) // Show only top 3 recent errors
      }
    })
    
    // Overall system health
    const criticalApis = apiStatus.filter(api => api.riskLevel === 'critical')
    const highRiskApis = apiStatus.filter(api => api.riskLevel === 'high')
    
    let systemHealth: 'healthy' | 'warning' | 'critical'
    let systemMessage: string
    
    if (criticalApis.length > 0) {
      systemHealth = 'critical'
      systemMessage = `${criticalApis.length} API(s) at critical usage levels`
    } else if (highRiskApis.length > 0) {
      systemHealth = 'warning'
      systemMessage = `${highRiskApis.length} API(s) at high usage levels`
    } else {
      systemHealth = 'healthy'
      systemMessage = 'All APIs within safe usage limits'
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      systemHealth,
      systemMessage,
      apis: apiStatus,
      summary: {
        totalApis: apiStatus.length,
        criticalApis: criticalApis.length,
        highRiskApis: highRiskApis.length,
        averageSuccessRate: Math.round(
          (apiStatus.reduce((sum, api) => sum + api.successRate, 0) / apiStatus.length) * 10
        ) / 10
      }
    })
    
  } catch (error) {
    console.error('❌ Error fetching rate limit statistics:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch rate limit statistics',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * POST /api/admin/rate-limits/reset
 * Reset rate limit counters for testing (use with caution)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, apiName } = body
    
    if (action === 'reset' && apiName) {
      // This would require implementing a reset method in the rate limiter
      // For now, just return a message
      return NextResponse.json({
        success: true,
        message: `Rate limit reset requested for ${apiName}`,
        note: 'Reset functionality would be implemented for testing purposes only',
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action or missing apiName',
      timestamp: new Date().toISOString()
    }, { status: 400 })
    
  } catch (error) {
    console.error('❌ Error in rate limit reset:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process rate limit reset',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

function getApiDisplayName(apiName: string): string {
  const displayNames: Record<string, string> = {
    'etherscan': 'Etherscan API',
    'coingecko': 'CoinGecko API',
    'alpha_vantage': 'Alpha Vantage API',
    'newsapi': 'NewsAPI',
    'sec_edgar': 'SEC EDGAR API',
    'fmp': 'Financial Modeling Prep API'
  }
  
  return displayNames[apiName] || apiName
}
