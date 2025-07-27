'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Newspaper, Calendar, Globe } from 'lucide-react'

interface NewsArticle {
  title: string
  description: string
  url: string
  urlToImage: string | null
  publishedAt: string
  source: {
    id: string | null
    name: string
  }
  content: string | null
}

interface NewsData {
  ticker: string
  companyName: string
  articles: NewsArticle[]
  totalResults: number
  lastUpdate: string
  error?: string
  message?: string
}

interface CompanyNewsProps {
  ticker: string
}

export default function CompanyNews({ ticker }: CompanyNewsProps) {
  const [newsData, setNewsData] = useState<NewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/companies/${ticker}/news`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch company news')
        }
        
        setNewsData(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching company news:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch company news')
      } finally {
        setLoading(false)
      }
    }

    if (ticker) {
      fetchNews()
    }
  }, [ticker])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const truncateDescription = (description: string, maxLength: number = 150) => {
    if (!description) return ''
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength).trim() + '...'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Newspaper className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Latest News</h3>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
          <Newspaper className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Latest News</h3>
        </div>
        <div className="text-gray-500 text-sm">
          Unable to load company news at this time
        </div>
      </div>
    )
  }

  if (!newsData) {
    return null
  }

  if (newsData.message && newsData.articles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Newspaper className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Latest News</h3>
        </div>
        <div className="text-gray-500 text-sm">
          {newsData.message === 'News API not configured' ? 
            'News integration not configured' : 
            `No recent news found for ${ticker}`
          }
        </div>
      </div>
    )
  }

  if (newsData.articles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Newspaper className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Latest News</h3>
        </div>
        <div className="text-gray-500 text-sm">
          No recent news found for {newsData.companyName}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Newspaper className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Latest News</h3>
        </div>
        <div className="text-xs text-gray-500">
          {newsData.totalResults} articles found
        </div>
      </div>

      <div className="space-y-4">
        {newsData.articles.map((article, index) => (
          <div key={index} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
            <div className="flex items-start space-x-3">
              {article.urlToImage && (
                <img
                  src={article.urlToImage}
                  alt=""
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 leading-5 mb-2">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    {article.title}
                  </a>
                </h4>
                
                {article.description && (
                  <p className="text-sm text-gray-600 mb-2 leading-5">
                    {truncateDescription(article.description)}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Globe className="h-3 w-3" />
                      <span>{article.source.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    <span>Read</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Last updated: {formatDate(newsData.lastUpdate)}
        </div>
      </div>
    </div>
  )
}
