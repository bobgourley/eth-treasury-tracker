import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number | bigint | undefined): string {
  if (num === undefined || num === null) return 'N/A'
  
  const numValue = typeof num === 'bigint' ? Number(num) : num
  
  if (numValue >= 1e9) {
    return `$${(numValue / 1e9).toFixed(2)}B`
  } else if (numValue >= 1e6) {
    return `$${(numValue / 1e6).toFixed(2)}M`
  } else if (numValue >= 1e3) {
    return `$${(numValue / 1e3).toFixed(2)}K`
  }
  return `$${numValue.toFixed(2)}`
}

export function formatEth(eth: number | undefined): string {
  if (eth === undefined || eth === null) return 'N/A'
  return `${eth.toLocaleString()} ETH`
}

export function formatPercentage(percent: number | undefined): string {
  if (percent === undefined || percent === null) return 'N/A'
  return `${percent.toFixed(2)}%`
}

export function formatShares(num: number | bigint | undefined): string {
  if (num === undefined || num === null) return 'N/A'
  
  const numValue = typeof num === 'bigint' ? Number(num) : num
  
  if (numValue >= 1e9) {
    return `${(numValue / 1e9).toFixed(2)}B`
  } else if (numValue >= 1e6) {
    return `${(numValue / 1e6).toFixed(2)}M`
  } else if (numValue >= 1e3) {
    return `${(numValue / 1e3).toFixed(2)}K`
  }
  return numValue.toLocaleString()
}
