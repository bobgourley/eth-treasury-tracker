'use client'

import { useState, useEffect } from 'react'
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

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Ethereum Treasury News</h1>
        <p>Loading news...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Ethereum Treasury News</h1>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={fetchNews}>Retry</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Ethereum Treasury News</h1>
      <p>Latest news and updates about companies holding Ethereum in their treasuries</p>
      
      {newsData && (
        <div style={{ marginBottom: '2rem' }}>
          <h2>Statistics</h2>
          <p>Total Articles: {newsData.stats.total}</p>
          <p>Company Specific: {newsData.stats.companySpecific}</p>
          <p>General: {newsData.stats.general}</p>
          <p>Companies Tracked: {newsData.stats.companiesTracked}</p>
          <button onClick={fetchNews}>Refresh</button>
        </div>
      )}

      {newsData && newsData.articles.length > 0 && (
        <div>
          <h2>News Articles</h2>
          {newsData.articles.map((article, index) => (
            <div key={index} style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
              <h3>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  {article.title}
                </a>
              </h3>
              <p>{article.description}</p>
              <p>Source: {article.source.name}</p>
              {article.company && (
                <p>Company: {article.company} ({article.ticker})</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <Link href="/">← Back to Home</Link>
      </div>
    </div>
  )
}
