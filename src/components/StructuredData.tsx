import Script from 'next/script'

interface StructuredDataProps {
  type?: 'website' | 'dataset' | 'organization'
  data?: Record<string, unknown>
}

export function StructuredData({ type = 'website', data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': type === 'website' ? 'WebSite' : type === 'dataset' ? 'Dataset' : 'Organization',
      name: 'Ethereum Treasury Companies',
      description: 'Comprehensive tracking of publicly traded companies holding Ethereum (ETH) in their corporate treasuries, including real-time metrics, market data, and financial analysis.',
      url: 'https://www.ethereumlist.com',
      author: {
        '@type': 'Organization',
        name: 'Ethereum Treasury Tracker'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Ethereum Treasury Tracker',
        url: 'https://www.ethereumlist.com'
      },
      keywords: [
        'Ethereum treasury',
        'corporate ETH holdings',
        'cryptocurrency investments',
        'public companies',
        'blockchain assets',
        'digital asset treasury',
        'ETH per share',
        'market capitalization',
        'premium discount analysis'
      ],
      inLanguage: 'en-US',
      dateModified: new Date().toISOString(),
      mainEntity: {
        '@type': 'Dataset',
        name: 'Corporate Ethereum Holdings Database',
        description: 'Real-time data on Ethereum holdings by publicly traded companies',
        keywords: 'ethereum, corporate treasury, ETH holdings, public companies',
        creator: {
          '@type': 'Organization',
          name: 'Ethereum Treasury Tracker'
        }
      }
    }

    if (type === 'dataset') {
      return {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: 'Corporate Ethereum Treasury Holdings',
        description: 'Comprehensive dataset of publicly traded companies holding Ethereum in their corporate treasuries, updated in real-time with market data and financial metrics.',
        keywords: [
          'Ethereum',
          'corporate treasury',
          'ETH holdings',
          'public companies',
          'cryptocurrency',
          'blockchain assets',
          'financial data',
          'market analysis'
        ],
        creator: {
          '@type': 'Organization',
          name: 'Ethereum Treasury Tracker'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Ethereum Treasury Tracker'
        },
        url: 'https://www.ethereumlist.com',
        dateModified: new Date().toISOString(),
        license: 'https://creativecommons.org/licenses/by/4.0/',
        distribution: {
          '@type': 'DataDownload',
          encodingFormat: 'application/json',
          contentUrl: 'https://www.ethereumlist.com/api/companies'
        },
        variableMeasured: [
          'ETH Holdings',
          'Market Capitalization',
          'ETH per Share',
          'Premium/Discount to NAV',
          'Total ETH Value'
        ]
      }
    }

    return { ...baseData, ...data }
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData())
      }}
    />
  )
}
