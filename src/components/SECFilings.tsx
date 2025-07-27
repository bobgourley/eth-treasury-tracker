'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, FileText, Calendar, Building } from 'lucide-react'

interface SECFiling {
  accessionNumber: string
  filingDate: string
  reportDate: string
  acceptanceDateTime: string
  act: string
  form: string
  fileNumber: string
  filmNumber: string
  items: string
  size: string
  isXBRL: string
  isInlineXBRL: string
  primaryDocument: string
  primaryDocDescription: string
}

interface SECFilingsData {
  ticker: string
  cik: string
  filings: SECFiling[]
  lastUpdate: string
  error?: string
}

interface SECFilingsProps {
  ticker: string
}

export default function SECFilings({ ticker }: SECFilingsProps) {
  const [filingsData, setFilingsData] = useState<SECFilingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFilings = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/companies/${ticker}/filings`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch SEC filings')
        }
        
        setFilingsData(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching SEC filings:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch SEC filings')
      } finally {
        setLoading(false)
      }
    }

    if (ticker) {
      fetchFilings()
    }
  }, [ticker])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getFilingUrl = (accessionNumber: string, primaryDocument: string, cik: string) => {
    const accessionNumberClean = accessionNumber.replace(/-/g, '')
    return `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accessionNumberClean}/${primaryDocument}`
  }

  const getFormDescription = (form: string) => {
    const descriptions: { [key: string]: string } = {
      '10-K': 'Annual Report',
      '10-Q': 'Quarterly Report',
      '8-K': 'Current Report',
      '10-K/A': 'Annual Report (Amendment)',
      '10-Q/A': 'Quarterly Report (Amendment)',
      '8-K/A': 'Current Report (Amendment)',
      'DEF 14A': 'Proxy Statement',
      'S-1': 'Registration Statement',
      'S-3': 'Registration Statement',
      'SC 13G': 'Beneficial Ownership Report',
      'SC 13D': 'Beneficial Ownership Report',
      '4': 'Insider Trading Report',
      '3': 'Initial Statement of Ownership'
    }
    return descriptions[form] || form
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Building className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Latest SEC Filings</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded flex-1"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Building className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Latest SEC Filings</h3>
        </div>
        <div className="text-gray-500 text-sm">
          {error.includes('not found') ? 
            `No SEC filings found for ${ticker}` : 
            'Unable to load SEC filings at this time'
          }
        </div>
      </div>
    )
  }

  if (!filingsData || filingsData.filings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Building className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Latest SEC Filings</h3>
        </div>
        <div className="text-gray-500 text-sm">
          No recent SEC filings available for {ticker}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Building className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Latest SEC Filings</h3>
        </div>
        <div className="text-xs text-gray-500">
          CIK: {filingsData.cik}
        </div>
      </div>

      <div className="space-y-3">
        {filingsData.filings.slice(0, 5).map((filing, index) => (
          <div key={filing.accessionNumber} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-3 flex-1">
              <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {filing.form}
                  </span>
                  <span className="text-sm text-gray-600 truncate">
                    {getFormDescription(filing.form)}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Filed: {formatDate(filing.filingDate)}</span>
                  </div>
                  {filing.reportDate && filing.reportDate !== filing.filingDate && (
                    <span>Period: {formatDate(filing.reportDate)}</span>
                  )}
                </div>
              </div>
            </div>
            <a
              href={getFilingUrl(filing.accessionNumber, filing.primaryDocument, filingsData.cik)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <span>View</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last updated: {formatDate(filingsData.lastUpdate)}</span>
          <a
            href={`https://www.sec.gov/edgar/search/#/ciks=${filingsData.cik}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
          >
            <span>View all filings</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
