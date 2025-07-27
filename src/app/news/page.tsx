'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ExternalLink, Calendar, Building2, Globe, TrendingUp, Clock } from 'lucide-react'

interface NewsArticle {
  title: string
  description: string
  url: string
  urlToImage: string | null
  publishedAt: string
  source: {
    name: string
  }
  company?: string
  ticker?: string
}

interface NewsResponse {
  articles: NewsArticle[]
  stats: {
    total: number
    companySpecific: number
    general: number
    searchQueries: number
    companiesTracked: number
  }
  lastUpdated: string
}

export default function NewsPage() {
  const [newsData, setNewsData] = useState<NewsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'company' | 'general'>('all')

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/news')
      const data = await response.json()
      
      if (response.ok) {
        setNewsData(data)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch news')
      }
    } catch (err) {
      setError('Failed to fetch news')
      console.error('Error fetching news:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  const getFilteredArticles = () => {
    if (!newsData) return []
    
    switch (filter) {
      case 'company':
        return newsData.articles.filter(article => article.company)
      case 'general':
        return newsData.articles.filter(article => !article.company)
      default:
        return newsData.articles
    }
  }

  const filteredArticles = getFilteredArticles()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Ethereum Treasury Companies
              </Link>
              <div className="hidden md:flex space-x-6 text-sm">
                <Link href="/" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                <Link href="/analytics" className="text-gray-600 hover:text-gray-900">Analytics</Link>
                <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
                <Link href="/news" className="text-blue-600 font-medium">News</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ethereum Treasury News
          </h1>
          <p className="text-gray-600 text-lg">
            Latest news and updates about companies holding Ethereum in their treasuries
          </p>
        </div>

        {/* Stats and Filters */}
        {newsData && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 lg:mb-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{newsData.stats.total}</div>
                  <div className="text-sm text-gray-600">Total Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{newsData.stats.companySpecific}</div>
                  <div className="text-sm text-gray-600">Company Specific</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{newsData.stats.general}</div>
                  <div className="text-sm text-gray-600">General ETH Treasury</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{newsData.stats.companiesTracked}</div>
                  <div className="text-sm text-gray-600">Companies Tracked</div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All News
                </button>
                <button
                  onClick={() => setFilter('company')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'company'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Company News
                </button>
                <button
                  onClick={() => setFilter('general')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'general'
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  General ETH Treasury
                </button>
              </div>
            </div>

            {/* Last Updated */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                Last updated: {new Date(newsData.lastUpdated).toLocaleString()}
                <button
                  onClick={fetchNews}
                  className="ml-4 text-blue-600 hover:text-blue-700 font-medium"
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading latest news...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <div className="text-red-600 font-medium">Error loading news</div>
            </div>
            <div className="text-red-700 mt-1">{error}</div>
            <button
              onClick={fetchNews}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* News Articles */}
        {!loading && !error && filteredArticles.length > 0 && (
          <div className="space-y-6">
            {filteredArticles.map((article, index) => (
              <article
                key={`${article.url}-${index}`}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:space-x-6">
                    {/* Article Image */}
                    {article.urlToImage && (
                      <div className="lg:w-48 lg:flex-shrink-0 mb-4 lg:mb-0">
                        <img
                          src={article.urlToImage}
                          alt={article.title}
                          className="w-full h-32 lg:h-24 object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      </div>
                    )}

                    {/* Article Content */}
                    <div className="flex-1">
                      {/* Company Badge */}
                      {article.company && (
                        <div className="flex items-center mb-2">
                          <Building2 className="w-4 h-4 text-green-600 mr-1" />
                          <Link
                            href={`/companies/${article.ticker}`}
                            className="text-green-600 hover:text-green-700 font-medium text-sm"
                          >
                            {article.company} ({article.ticker})
                          </Link>
                        </div>
                      )}

                      {/* Article Title */}
                      <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 transition-colors"
                        >
                          {article.title}
                        </a>
                      </h2>

                      {/* Article Description */}
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {article.description}
                      </p>

                      {/* Article Meta */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Globe className="w-4 h-4 mr-1" />
                            {article.source.name}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(article.publishedAt)}
                          </div>
                        </div>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Read Full Article
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* No Articles State */}
        {!loading && !error && filteredArticles.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? 'No news articles available at the moment.'
                : `No ${filter} articles found. Try switching to a different filter.`
              }
            </p>
            <button
              onClick={fetchNews}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh News
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
