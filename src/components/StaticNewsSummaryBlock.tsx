import { memo } from 'react'
import Link from 'next/link'
import { StaticNewsData } from '@/lib/staticDataFetcher'

interface StaticNewsSummaryBlockProps {
  articles: StaticNewsData[]
}

function StaticNewsSummaryBlock({ articles }: StaticNewsSummaryBlockProps) {
  // Get top 3 articles for display
  const topArticles = articles.slice(0, 3)

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Latest Ethereum News</h2>
        <Link 
          href="/news" 
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All →
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {topArticles.map((article, index) => (
          <div key={index} className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
              {article.url !== '#' ? (
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors"
                >
                  {article.title}
                </a>
              ) : (
                <span>{article.title}</span>
              )}
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
              {article.description}
            </p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{article.source.name}</span>
              <span>
                {new Date(article.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-400 text-center mt-4">
        <span className="text-green-500">• Static Data</span>
      </div>
    </div>
  )
}

export default memo(StaticNewsSummaryBlock)
