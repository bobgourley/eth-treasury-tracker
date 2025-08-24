/**
 * Centralized constants for the Ethereum Treasury Tracker
 * This ensures consistency across all components and APIs
 */

// Fallback values for API failures - ONLY used when database and live APIs are unavailable
export const FALLBACK_ETH_PRICE = 3500 // USD - Last resort fallback
export const FALLBACK_ETH_SUPPLY = 120709652 // ETH - Last resort fallback
export const FALLBACK_BTC_PRICE = 95000 // USD - Last resort fallback

// API rate limits and caching
export const CACHE_DURATION = {
  ETH_PRICE: 5 * 60 * 1000, // 5 minutes
  ETH_SUPPLY: 24 * 60 * 60 * 1000, // 24 hours
  COMPANY_DATA: 15 * 60 * 1000, // 15 minutes
  MARKET_DATA: 10 * 60 * 1000, // 10 minutes
} as const

// Database limits
export const MAX_COMPANIES = 50
export const MAX_ETFS = 20

// Display formatting
export const DECIMAL_PLACES = {
  ETH: 2,
  USD: 2,
  PERCENTAGE: 3,
  RATIO: 4,
} as const

// Admin settings
export const ADMIN_SESSION_DURATION = 4 * 60 * 60 // 4 hours in seconds
