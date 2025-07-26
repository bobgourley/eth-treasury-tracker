export interface Company {
  id: number
  name: string
  ticker?: string
  website?: string
  ethHoldings?: number
  ethAddresses?: string
  marketCap?: bigint
  sharesOutstanding?: bigint
  stockPrice?: number
  ethPerShare?: number
  mnavRatio?: number
  stakingYield?: number
  yieldSources?: string
  capitalStructure?: string
  fundingSources?: string
  lastUpdated: Date
  createdAt: Date
  isActive: boolean
}

export interface SystemMetrics {
  id: number
  totalEthHoldings: number
  totalCompanies: number
  ethPrice?: number
  totalEthValue?: number
  totalMarketCap?: number
  ethSupplyPercent?: number
  lastUpdate: Date
  lastStockUpdate?: Date
}

export interface CompanyWithMetrics extends Company {
  formattedMarketCap?: string
  formattedEthHoldings?: string
}
