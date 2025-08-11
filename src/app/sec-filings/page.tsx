'use client'

import { useState, useEffect, useCallback } from 'react'
import FuturisticCard from '@/components/FuturisticCard'
import styles from '@/styles/futuristic.module.css'

// Simple Badge Component for SEC filings
function Badge({ children, variant = 'secondary' }: { children: React.ReactNode; variant?: 'secondary' | 'info' }) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  const variantClasses = {
    secondary: 'bg-gray-700 text-gray-300',
    info: 'bg-cyan-900 text-cyan-300'
  }
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </span>
  )
}

interface SecFiling {
  id: number
  accessionNumber: string
  companyName: string
  cik: string
  formType: string
  filingDate: string
  reportTitle?: string
  edgarUrl: string
  fullTextUrl?: string
  createdAt: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface FilingsResponse {
  success: boolean
  data: {
    filings: SecFiling[]
    pagination: PaginationInfo
    filters: {
      sortBy: string
      sortOrder: string
      formType?: string
      company?: string
      startDate?: string
      endDate?: string
    }
  }
}

export default function SecFilingsPage() {
  const [filings, setFilings] = useState<SecFiling[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter and sort state
  const [sortBy, setSortBy] = useState('filingDate')
  const [sortOrder, setSortOrder] = useState('desc')
  const [formTypeFilter, setFormTypeFilter] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch filings data
  const fetchFilings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '25',
        sortBy,
        sortOrder
      })

      if (formTypeFilter) params.append('formType', formTypeFilter)
      if (companyFilter) params.append('company', companyFilter)

      const response = await fetch(`/api/sec-filings?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: FilingsResponse = await response.json()
      
      if (data.success) {
        setFilings(data.data.filings)
        setPagination(data.data.pagination)
      } else {
        throw new Error('Failed to fetch filings')
      }
    } catch (err) {
      console.error('Error fetching SEC filings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch SEC filings')
    } finally {
      setLoading(false)
    }
  }, [currentPage, sortBy, sortOrder, formTypeFilter, companyFilter])

  // Effect to fetch data when filters change
  useEffect(() => {
    fetchFilings()
  }, [fetchFilings])

  // Handle sort change
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setCurrentPage(1) // Reset to first page
  }

  // Handle filter change
  const handleFilterChange = () => {
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get unique form types for filter dropdown
  const uniqueFormTypes = Array.from(new Set(filings.map(f => f.formType))).sort()

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          🏛️ SEC ETH Filings
        </h1>
        <p className={styles.subtitle}>
          Comprehensive SEC filings mentioning Ethereum
        </p>
      </div>

      {/* Filters and Controls */}
      <FuturisticCard title="Search & Filter Options" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Company Filter */}
          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={companyFilter}
              onChange={(e) => {
                setCompanyFilter(e.target.value)
                handleFilterChange()
              }}
              placeholder="Search companies..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Form Type Filter */}
          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-2">
              Filing Type
            </label>
            <select
              value={formTypeFilter}
              onChange={(e) => {
                setFormTypeFilter(e.target.value)
                handleFilterChange()
              }}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All Types</option>
              <option value="10-K">10-K (Annual)</option>
              <option value="10-Q">10-Q (Quarterly)</option>
              <option value="8-K">8-K (Current)</option>
              <option value="S-1">S-1 (Registration)</option>
              <option value="DEF 14A">DEF 14A (Proxy)</option>
              {uniqueFormTypes.map(type => (
                !['10-K', '10-Q', '8-K', 'S-1', 'DEF 14A'].includes(type) && (
                  <option key={type} value={type}>{type}</option>
                )
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="filingDate">Filing Date</option>
              <option value="companyName">Company Name</option>
              <option value="formType">Filing Type</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-2">
              Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        {pagination && (
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
              {pagination.totalCount} filings
            </span>
            <Badge variant="info">
              Page {pagination.currentPage} of {pagination.totalPages}
            </Badge>
          </div>
        )}
      </FuturisticCard>

      {/* Loading State */}
      {loading && (
        <FuturisticCard title="Loading">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading SEC filings...</p>
          </div>
        </FuturisticCard>
      )}

      {/* Error State */}
      {error && (
        <FuturisticCard title="Error">
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">❌ {error}</p>
            <button
              onClick={fetchFilings}
              className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </FuturisticCard>
      )}

      {/* Filings Table */}
      {!loading && !error && filings.length > 0 && (
        <FuturisticCard title="SEC Filings Results">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th 
                    className="text-left py-3 px-4 cursor-pointer hover:text-cyan-300 transition-colors"
                    onClick={() => handleSort('filingDate')}
                  >
                    Date {sortBy === 'filingDate' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 cursor-pointer hover:text-cyan-300 transition-colors"
                    onClick={() => handleSort('formType')}
                  >
                    Type {sortBy === 'formType' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 cursor-pointer hover:text-cyan-300 transition-colors"
                    onClick={() => handleSort('companyName')}
                  >
                    Company {sortBy === 'companyName' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="text-left py-3 px-4">Report Title</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filings.map((filing) => (
                  <tr key={filing.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-4 text-gray-300">
                      {formatDate(filing.filingDate)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">
                        {filing.formType}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      <div>
                        <div className="font-medium">{filing.companyName}</div>
                        <div className="text-xs text-gray-500">CIK: {filing.cik}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300 max-w-xs">
                      <div className="truncate" title={filing.reportTitle}>
                        {filing.reportTitle || 'SEC Filing'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <a
                          href={filing.edgarUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-cyan-600 text-white text-xs rounded hover:bg-cyan-700 transition-colors"
                        >
                          View Filing
                        </a>
                        {filing.fullTextUrl && (
                          <a
                            href={filing.fullTextUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                          >
                            Full Text
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FuturisticCard>
      )}

      {/* Empty State */}
      {!loading && !error && filings.length === 0 && (
        <FuturisticCard title="No Results">
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No SEC filings found matching your criteria.</p>
            <p className="text-sm text-gray-500">
              Try adjusting your filters or check back later for new filings.
            </p>
          </div>
        </FuturisticCard>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <FuturisticCard title="Navigation" className="mt-6">
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={!pagination.hasPrevPage}
              className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              Previous
            </button>
            
            <span className="text-gray-300">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={!pagination.hasNextPage}
              className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              Next
            </button>
          </div>
        </FuturisticCard>
      )}
    </div>
  )
}
