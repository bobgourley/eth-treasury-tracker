'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import FuturisticLayout from '@/components/FuturisticLayout'
import FuturisticCard, { MetricDisplay } from '@/components/FuturisticCard'
import { FuturisticButton, FuturisticBadge, LoadingSpinner } from '@/components/FuturisticUI'
import { ExternalLink, Building2, Clock, RefreshCw, Globe, Calendar, TrendingUp } from 'lucide-react'
import styles from '@/styles/futuristic.module.css'

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
  const [filter, setFilter] = useState<'all' | 'company' | 'general'>('company')

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
    <FuturisticLayout 
      title="Ethereum Treasury News" 
      showLiveIndicator={true}
    >
      {/* Page Description */}
      <div className={styles.cardGrid}>
        <FuturisticCard 
          title="News Overview" 
          icon="📰" 
          size="full"
          variant="info"
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Latest news and updates about companies holding Ethereum in their treasuries, 
            ETF developments, and institutional adoption trends.
          </p>
        </FuturisticCard>
      </div>

      {/* Stats and Filters */}
      {newsData && (
        <div className={styles.cardGrid}>
          {/* Stats Cards */}
          <FuturisticCard title="Total Articles" icon="📊">
            <MetricDisplay
              value={newsData.stats.total}
              label="Articles Tracked"
              color="cyan"
            />
          </FuturisticCard>

          <FuturisticCard title="Company News" icon="🏢">
            <MetricDisplay
              value={newsData.stats.companySpecific}
              label="Company Specific"
              color="green"
            />
          </FuturisticCard>

          <FuturisticCard title="General News" icon="🌐">
            <MetricDisplay
              value={newsData.stats.general}
              label="ETH Treasury News"
              color="blue"
            />
          </FuturisticCard>

          <FuturisticCard title="Companies" icon="📈">
            <MetricDisplay
              value={newsData.stats.companiesTracked}
              label="Companies Tracked"
              color="orange"
            />
          </FuturisticCard>
        </div>
      )}

      {/* Filters and Controls */}
      {newsData && (
        <div className={styles.cardGrid}>
          <FuturisticCard 
            title="News Filters" 
            icon="🔍" 
            size="wide"
            actions={
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <Clock size={16} />
                  Last updated: {new Date(newsData.lastUpdated).toLocaleString()}
                </div>
                <FuturisticButton
                  onClick={fetchNews}
                  variant="secondary"
                  size="small"
                  disabled={loading}
                >
                  <RefreshCw size={16} />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </FuturisticButton>
              </div>
            }
          >
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <FuturisticButton
                onClick={() => setFilter('all')}
                variant={filter === 'all' ? 'primary' : 'ghost'}
                size="medium"
              >
                All News ({newsData.stats.total})
              </FuturisticButton>
              <FuturisticButton
                onClick={() => setFilter('company')}
                variant={filter === 'company' ? 'primary' : 'ghost'}
                size="medium"
              >
                Company News ({newsData.stats.companySpecific})
              </FuturisticButton>
              <FuturisticButton
                onClick={() => setFilter('general')}
                variant={filter === 'general' ? 'primary' : 'ghost'}
                size="medium"
              >
                General News ({newsData.stats.general})
              </FuturisticButton>
            </div>
          </FuturisticCard>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className={styles.cardGrid}>
          <FuturisticCard title="Loading" icon="⟳" size="full" loading={true}>
            <LoadingSpinner size="large" text="Loading latest news..." />
          </FuturisticCard>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={styles.cardGrid}>
          <FuturisticCard title="Error" icon="❌" variant="warning" size="full">
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Error loading news</p>
              <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>{error}</p>
              <FuturisticButton
                onClick={fetchNews}
                variant="danger"
                size="medium"
              >
                Try Again
              </FuturisticButton>
            </div>
          </FuturisticCard>
        </div>
      )}

      {/* News Articles */}
      {!loading && !error && filteredArticles.length > 0 && (
        <div className={styles.cardGrid}>
          {filteredArticles.map((article, index) => (
            <FuturisticCard
              key={`${article.url}-${index}`}
              title={article.title}
              icon="📰"
              size="wide"
              variant="default"
              actions={
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', textDecoration: 'none', fontSize: '0.875rem' }}
                >
                  Read Article
                  <ExternalLink size={16} />
                </a>
              }
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                {/* Article Image */}
                {article.urlToImage && (
                  <div style={{ flexShrink: 0, width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-primary)' }}>
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  </div>
                )}

                {/* Article Content */}
                <div style={{ flex: 1 }}>
                  {/* Company Badge */}
                  {article.company && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <FuturisticBadge variant="success" size="small">
                        <Building2 size={14} style={{ marginRight: '0.25rem' }} />
                        <Link
                          href={`/companies/${article.ticker}`}
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {article.company} ({article.ticker})
                        </Link>
                      </FuturisticBadge>
                    </div>
                  )}

                  {/* Article Description */}
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    lineHeight: '1.5', 
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {article.description}
                  </p>

                  {/* Article Meta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Globe size={14} />
                      {article.source.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} />
                      {formatDate(article.publishedAt)}
                    </div>
                  </div>
                </div>
              </div>
            </FuturisticCard>
          ))}
        </div>
      )}

      {/* No Articles State */}
      {!loading && !error && filteredArticles.length === 0 && (
        <div className={styles.cardGrid}>
          <FuturisticCard title="No Articles Found" icon="📭" size="full" variant="info">
            <div style={{ textAlign: 'center' }}>
              <TrendingUp size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>No articles found</h3>
              <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {filter === 'all' 
                  ? 'No news articles available at the moment.'
                  : filter === 'company'
                  ? 'No news found for tracked companies. Try "All News" or "General ETH Treasury" for broader coverage.'
                  : 'No general ETH treasury articles found. Try switching to a different filter.'
                }
              </p>
              <FuturisticButton
                onClick={fetchNews}
                variant="primary"
                size="medium"
              >
                <RefreshCw size={16} />
                Refresh News
              </FuturisticButton>
            </div>
          </FuturisticCard>
        </div>
      )}
    </FuturisticLayout>
  )
}
