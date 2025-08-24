/**
 * Rate Limiting Utility for External API Calls
 * Tracks API usage and prevents exceeding free tier limits
 */

interface RateLimitConfig {
  name: string
  dailyLimit: number
  perMinuteLimit?: number
  perSecondLimit?: number
  resetTime?: 'daily' | 'rolling'
}

interface ApiCallRecord {
  timestamp: number
  endpoint: string
  success: boolean
  error?: string
}

class RateLimiter {
  private callHistory: Map<string, ApiCallRecord[]> = new Map()
  private configs: Map<string, RateLimitConfig> = new Map()

  constructor() {
    // Initialize rate limit configurations for all external APIs
    this.configs.set('etherscan', {
      name: 'Etherscan API',
      dailyLimit: 100000, // Free tier: 100K calls/day
      perSecondLimit: 5,   // Free tier: 5 calls/second
      resetTime: 'daily'
    })

    this.configs.set('coingecko', {
      name: 'CoinGecko API',
      dailyLimit: 10000,   // Conservative estimate
      perMinuteLimit: 50,  // Free tier: 50 calls/minute
      resetTime: 'rolling'
    })

    this.configs.set('alpha_vantage', {
      name: 'Alpha Vantage API',
      dailyLimit: 25,      // Free tier: 25 requests/day
      perMinuteLimit: 5,   // Free tier: 5 requests/minute
      resetTime: 'daily'
    })

    this.configs.set('newsapi', {
      name: 'NewsAPI',
      dailyLimit: 1000,    // Free tier: 1,000 requests/day
      resetTime: 'daily'
    })

    this.configs.set('sec_edgar', {
      name: 'SEC EDGAR API',
      dailyLimit: 86400,   // Conservative: 10/sec * 86400 seconds
      perSecondLimit: 10,  // SEC limit: 10 requests/second
      resetTime: 'rolling'
    })

    this.configs.set('fmp', {
      name: 'Financial Modeling Prep API',
      dailyLimit: 250,     // Free tier: 250 requests/day
      resetTime: 'daily'
    })
  }

  /**
   * Check if an API call is allowed based on rate limits
   */
  async canMakeCall(apiName: string, endpoint: string = 'default'): Promise<{
    allowed: boolean
    reason?: string
    waitTime?: number
    usage: {
      dailyUsage: number
      dailyLimit: number
      recentCalls: number
    }
  }> {
    const config = this.configs.get(apiName)
    if (!config) {
      return { 
        allowed: true, 
        usage: { dailyUsage: 0, dailyLimit: 0, recentCalls: 0 }
      }
    }

    const history = this.getCallHistory(apiName)
    const now = Date.now()

    // Clean old records
    this.cleanOldRecords(apiName)

    // Check daily limit
    const dailyUsage = this.getDailyUsage(apiName)
    if (dailyUsage >= config.dailyLimit) {
      const resetTime = this.getNextResetTime(config.resetTime)
      return {
        allowed: false,
        reason: `Daily limit exceeded (${dailyUsage}/${config.dailyLimit})`,
        waitTime: resetTime - now,
        usage: { dailyUsage, dailyLimit: config.dailyLimit, recentCalls: 0 }
      }
    }

    // Check per-minute limit
    if (config.perMinuteLimit) {
      const minuteUsage = this.getUsageInWindow(apiName, 60 * 1000) // 1 minute
      if (minuteUsage >= config.perMinuteLimit) {
        return {
          allowed: false,
          reason: `Per-minute limit exceeded (${minuteUsage}/${config.perMinuteLimit})`,
          waitTime: 60 * 1000, // Wait 1 minute
          usage: { dailyUsage, dailyLimit: config.dailyLimit, recentCalls: minuteUsage }
        }
      }
    }

    // Check per-second limit
    if (config.perSecondLimit) {
      const secondUsage = this.getUsageInWindow(apiName, 1000) // 1 second
      if (secondUsage >= config.perSecondLimit) {
        return {
          allowed: false,
          reason: `Per-second limit exceeded (${secondUsage}/${config.perSecondLimit})`,
          waitTime: 1000, // Wait 1 second
          usage: { dailyUsage, dailyLimit: config.dailyLimit, recentCalls: secondUsage }
        }
      }
    }

    return {
      allowed: true,
      usage: { 
        dailyUsage, 
        dailyLimit: config.dailyLimit, 
        recentCalls: this.getUsageInWindow(apiName, 60 * 1000)
      }
    }
  }

  /**
   * Record an API call
   */
  recordCall(apiName: string, endpoint: string, success: boolean, error?: string): void {
    const history = this.getCallHistory(apiName)
    history.push({
      timestamp: Date.now(),
      endpoint,
      success,
      error
    })

    // Keep only recent records to prevent memory bloat
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    this.callHistory.set(apiName, history.filter(record => record.timestamp > oneDayAgo))
  }

  /**
   * Get usage statistics for an API
   */
  getUsageStats(apiName: string): {
    dailyUsage: number
    dailyLimit: number
    successRate: number
    recentErrors: string[]
    lastCall?: Date
  } {
    const config = this.configs.get(apiName)
    const history = this.getCallHistory(apiName)
    
    const dailyUsage = this.getDailyUsage(apiName)
    const dailyLimit = config?.dailyLimit || 0
    
    const successfulCalls = history.filter(r => r.success).length
    const successRate = history.length > 0 ? (successfulCalls / history.length) * 100 : 100
    
    const recentErrors = history
      .filter(r => !r.success && r.error)
      .slice(-5) // Last 5 errors
      .map(r => r.error!)
    
    const lastCall = history.length > 0 ? new Date(Math.max(...history.map(r => r.timestamp))) : undefined

    return {
      dailyUsage,
      dailyLimit,
      successRate,
      recentErrors,
      lastCall
    }
  }

  /**
   * Get all API usage statistics
   */
  getAllUsageStats(): Record<string, ReturnType<typeof this.getUsageStats>> {
    const stats: Record<string, ReturnType<typeof this.getUsageStats>> = {}
    
    for (const [apiName] of this.configs) {
      stats[apiName] = this.getUsageStats(apiName)
    }
    
    return stats
  }

  /**
   * Wait with exponential backoff if rate limited
   */
  async waitIfNeeded(apiName: string, endpoint: string = 'default'): Promise<void> {
    const check = await this.canMakeCall(apiName, endpoint)
    
    if (!check.allowed && check.waitTime) {
      console.warn(`⏳ Rate limited for ${apiName}: ${check.reason}. Waiting ${Math.ceil(check.waitTime / 1000)}s...`)
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, check.waitTime)
      })
    }
  }

  // Private helper methods
  private getCallHistory(apiName: string): ApiCallRecord[] {
    if (!this.callHistory.has(apiName)) {
      this.callHistory.set(apiName, [])
    }
    return this.callHistory.get(apiName)!
  }

  private cleanOldRecords(apiName: string): void {
    const history = this.getCallHistory(apiName)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    this.callHistory.set(apiName, history.filter(record => record.timestamp > oneDayAgo))
  }

  private getDailyUsage(apiName: string): number {
    const history = this.getCallHistory(apiName)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    return history.filter(record => record.timestamp > oneDayAgo).length
  }

  private getUsageInWindow(apiName: string, windowMs: number): number {
    const history = this.getCallHistory(apiName)
    const windowStart = Date.now() - windowMs
    return history.filter(record => record.timestamp > windowStart).length
  }

  private getNextResetTime(resetType: 'daily' | 'rolling' = 'daily'): number {
    if (resetType === 'daily') {
      // Next midnight UTC
      const tomorrow = new Date()
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
      tomorrow.setUTCHours(0, 0, 0, 0)
      return tomorrow.getTime()
    } else {
      // Rolling 24 hours
      return Date.now() + 24 * 60 * 60 * 1000
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter()

/**
 * Decorator function to wrap API calls with rate limiting
 */
export function withRateLimit<T extends unknown[], R>(
  apiName: string,
  endpoint: string = 'default'
) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: T): Promise<R> {
      // Check rate limits before making the call
      await rateLimiter.waitIfNeeded(apiName, endpoint)
      
      try {
        const result = await originalMethod.apply(this, args)
        rateLimiter.recordCall(apiName, endpoint, true)
        return result
      } catch (error) {
        rateLimiter.recordCall(apiName, endpoint, false, error instanceof Error ? error.message : 'Unknown error')
        throw error
      }
    }

    return descriptor
  }
}

/**
 * Utility function to wrap any API call with rate limiting
 */
export async function callWithRateLimit<T>(
  apiName: string,
  endpoint: string,
  apiCall: () => Promise<T>
): Promise<T> {
  await rateLimiter.waitIfNeeded(apiName, endpoint)
  
  try {
    const result = await apiCall()
    rateLimiter.recordCall(apiName, endpoint, true)
    return result
  } catch (error) {
    rateLimiter.recordCall(apiName, endpoint, false, error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}
