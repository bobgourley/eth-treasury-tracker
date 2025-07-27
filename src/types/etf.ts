// ETF Types - Completely isolated from company types

export interface Etf {
  id: number
  symbol: string
  name?: string
  ethHoldings?: number
  totalValue?: number
  aum?: number
  expenseRatio?: number
  nav?: number
  lastUpdated: Date
  createdAt: Date
  isActive: boolean
}

export interface EtfMetrics {
  id: number
  totalEthHeld: number
  totalAum: number
  totalValue: number
  etfCount: number
  avgExpenseRatio?: number
  ethPrice?: number
  lastUpdate: Date
}

// Financial Modeling Prep API Response Types
export interface FmpEtfInfo {
  symbol: string
  name: string
  nav: number
  expenseRatio: number
  aum: number
  // Add other fields as needed from FMP API
}

export interface FmpEtfHolding {
  asset: string
  sharesNumber: number
  marketValue: number
  weightPercentage: number
  // Add other fields as needed from FMP API
}

export interface EtfWithMetrics extends Etf {
  formattedAum?: string
  formattedTotalValue?: string
  formattedEthHoldings?: string
  ethPercentage?: number
}

// ETF Dashboard Summary
export interface EtfSummary {
  totalEtfs: number
  totalEthHeld: number
  totalAum: number
  totalValue: number
  avgExpenseRatio: number
  ethPrice: number
  lastUpdate: Date
  etfCount: number
}
