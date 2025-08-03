'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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

export default function NewsSummaryBlock() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/news')
        if (response.ok) {
          const data = await response.json()
          const recentArticles = (data.articles || [])
            .slice(0, 6) // Top 6 most recent articles
          
          setArticles(recentArticles)
        }
      } catch (error) {
        console.error('Failed to fetch news data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          <Link href="/news" className="hover:text-blue-600 transition-colors">
            Latest News
          </Link>
        </h3>
        <Link 
          href="/news" 
          className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          View All →
        </Link>
      </div>

      {articles.length > 0 ? (
        <div className="space-y-4">
          {articles.map((article, index) => (
            <div key={index} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
              <h4 className="font-medium text-gray-900 mb-2 leading-tight">
                <a 
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors line-clamp-2"
                >
                  {article.title}
                </a>
              </h4>
              
              {article.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {article.description}
                </p>
              )}
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <span>{article.source.name}</span>
                  {article.company && (
                    <>
                      <span>•</span>
                      <span className="text-blue-600 font-medium">
                        {article.company}
                      </span>
                    </>
                  )}
                </div>
                <span>
                  {new Date(article.publishedAt).toISOString().slice(0, 10)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p>No news articles available</p>
          <p className="text-sm mt-1">News API may not be configured</p>
        </div>
      )}
    </div>
  )
}
