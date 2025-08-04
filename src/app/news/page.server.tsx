import Link from 'next/link'

// Server-side data fetching
async function getNewsData() {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000'
        : 'https://ethereumlist.com'
    
    const response = await fetch(`${baseUrl}/api/news`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch news')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching news:', error)
    return null
  }
}

export default async function NewsPage() {
  const newsData = await getNewsData()

  if (!newsData) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ color: '#1f2937', marginBottom: '1rem' }}>Ethereum Treasury News</h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Latest news and updates about companies holding Ethereum in their treasuries
        </p>
        <div style={{ 
          padding: '2rem', 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#dc2626', marginBottom: '1rem' }}>Unable to load news data</p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Please try refreshing the page or check back later.
          </p>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: '2rem' }}>
        Ethereum Treasury News
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '1.125rem' }}>
        Latest news and updates about companies holding Ethereum in their treasuries
      </p>
      
      {/* Statistics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.5rem' }}>
            {newsData.stats.total}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Articles</div>
        </div>
        
        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>
            {newsData.stats.companySpecific}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Company Specific</div>
        </div>
        
        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '0.5rem' }}>
            {newsData.stats.general}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>General ETH Treasury</div>
        </div>
        
        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.5rem' }}>
            {newsData.stats.companiesTracked}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Companies Tracked</div>
        </div>
      </div>

      {/* News Articles */}
      {newsData.articles && newsData.articles.length > 0 && (
        <div>
          <h2 style={{ color: '#1f2937', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            Latest Articles ({newsData.articles.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {newsData.articles.map((article: {
              title: string;
              description: string;
              url: string;
              urlToImage: string | null;
              publishedAt: string;
              source: { name: string };
              company?: string;
              ticker?: string;
            }, index: number) => (
              <article key={index} style={{ 
                backgroundColor: 'white', 
                padding: '1.5rem', 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  {article.urlToImage && (
                    <div style={{ flexShrink: 0, width: '120px', height: '80px', borderRadius: '6px', overflow: 'hidden' }}>
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  
                  <div style={{ flex: 1 }}>
                    {article.company && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <span style={{ 
                          backgroundColor: '#dcfce7', 
                          color: '#166534', 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {article.company} ({article.ticker})
                        </span>
                      </div>
                    )}
                    
                    <h3 style={{ marginBottom: '0.75rem', fontSize: '1.125rem', fontWeight: '600' }}>
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#1f2937', textDecoration: 'none' }}
                      >
                        {article.title}
                      </a>
                    </h3>
                    
                    <p style={{ 
                      color: '#6b7280', 
                      lineHeight: '1.5', 
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {article.description}
                    </p>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      fontSize: '0.875rem', 
                      color: '#9ca3af' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span>📰 {article.source.name}</span>
                        <span>📅 {new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          color: '#3b82f6', 
                          textDecoration: 'none',
                          fontWeight: '500'
                        }}
                      >
                        Read Article →
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <Link href="/" style={{ 
          color: '#3b82f6', 
          textDecoration: 'none',
          fontSize: '1rem',
          fontWeight: '500'
        }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
