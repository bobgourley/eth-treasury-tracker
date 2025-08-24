// Google News Card Component for displaying Ethereum news
import React from 'react'
import FuturisticCard from './FuturisticCard'
import { FuturisticBadge } from './FuturisticUI'
import Link from 'next/link'
import styles from '@/styles/futuristic.module.css'

interface NewsArticle {
  title: string
  description: string
  url: string
  publishedAt: string
  source: {
    name: string
  }
  company?: string | null
  ticker?: string | null
}

interface GoogleNewsCardProps {
  articles: NewsArticle[]
  title?: string
  showViewAll?: boolean
}

export default function GoogleNewsCard({ 
  articles, 
  title = "Latest Ethereum News",
  showViewAll = true 
}: GoogleNewsCardProps) {
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
      
      if (diffInHours < 1) return 'Just now'
      if (diffInHours < 24) return `${diffInHours}h ago`
      
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) return `${diffInDays}d ago`
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    } catch {
      return 'Recently'
    }
  }

  const cleanDescription = (description: string) => {
    if (!description) return ''
    
    // Remove HTML tags and decode HTML entities
    const cleaned = description
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'") // Replace &#39; with '
      .trim()
    
    return cleaned
  }

  return (
    <FuturisticCard 
      title={title}
      icon="📰" 
      size="wide"
      actions={
        showViewAll ? (
          <Link href="/news">
            <FuturisticBadge variant="info">View All →</FuturisticBadge>
          </Link>
        ) : undefined
      }
    >
      <div className={styles.newsGrid}>
        {articles.length > 0 ? (
          articles.map((article, index) => (
            <div key={index} className={styles.newsItem}>
              <h4>
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.newsLink}
                >
                  {article.title}
                </a>
              </h4>
              {article.description && (
                <p className={styles.newsDescription}>
                  {(() => {
                    const cleaned = cleanDescription(article.description)
                    return cleaned.length > 150 
                      ? `${cleaned.substring(0, 150)}...` 
                      : cleaned
                  })()}
                </p>
              )}
              <div className={styles.newsMetadata}>
                <span className={styles.newsSource}>{article.source.name}</span>
                <span className={styles.newsTime}>{formatTimeAgo(article.publishedAt)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noNews}>
            <p>No recent Ethereum news available.</p>
            <p className={styles.newsSubtext}>News updates every 30 minutes.</p>
          </div>
        )}
      </div>
    </FuturisticCard>
  )
}
