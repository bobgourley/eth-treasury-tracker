'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Company {
  id: number
  name: string
  ticker: string
  lastUpdated: string
}

export default function HtmlSitemap() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies')
        if (response.ok) {
          const data = await response.json()
          setCompanies(data)
        }
      } catch (error) {
        console.error('Failed to fetch companies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-900">Site Map</h1>
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <span>•</span>
              <Link href="/about" className="hover:text-blue-600 transition-colors">
                About
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Main Pages */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Main Pages</h2>
            <div className="space-y-2">
              <Link 
                href="/" 
                className="block text-blue-600 hover:text-blue-800 hover:underline"
              >
                🏠 Dashboard
              </Link>
              <Link 
                href="/about" 
                className="block text-blue-600 hover:text-blue-800 hover:underline"
              >
                ℹ️ About
              </Link>
            </div>
          </div>

          {/* Analytics Pages */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Analytics</h2>
            <div className="space-y-2">
              <Link 
                href="/analytics/premium-discount" 
                className="block text-blue-600 hover:text-blue-800 hover:underline"
              >
                📊 Premium/Discount Analysis
              </Link>
              <Link 
                href="/analytics/exposure" 
                className="block text-blue-600 hover:text-blue-800 hover:underline"
              >
                📈 ETH Exposure Analytics
              </Link>
              <Link 
                href="/analytics/charts" 
                className="block text-blue-600 hover:text-blue-800 hover:underline"
              >
                📉 Interactive Charts
              </Link>
            </div>
          </div>

          {/* Company Profiles */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:col-span-2 lg:col-span-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Company Profiles
              {loading && <span className="text-sm text-gray-500 ml-2">(Loading...)</span>}
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-gray-500">Loading companies...</div>
              ) : companies.length > 0 ? (
                companies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/companies/${company.ticker}`}
                    className="block text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    🏢 {company.name} ({company.ticker})
                  </Link>
                ))
              ) : (
                <div className="text-gray-500">No companies found</div>
              )}
            </div>
          </div>
        </div>

        {/* SEO Information */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">For Search Engines</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>XML Sitemap:</strong>{' '}
              <a 
                href="/sitemap.xml" 
                className="text-blue-600 hover:text-blue-800 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                /sitemap.xml
              </a>
            </p>
            <p>
              <strong>Robots.txt:</strong>{' '}
              <a 
                href="/robots.txt" 
                className="text-blue-600 hover:text-blue-800 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                /robots.txt
              </a>
            </p>
            <p className="text-xs text-gray-500 mt-4">
              This sitemap is automatically updated when companies are added or modified.
              Last generated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
