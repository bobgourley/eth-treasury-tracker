import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ethereumlist.com'
  
  try {
    // Fetch all companies for dynamic routes
    const companies = await prisma.company.findMany({
      select: {
        ticker: true,
        lastUpdated: true
      }
    })
    
    await prisma.$disconnect()

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily', // Main page updates daily with new ETH prices, holdings, news
        priority: 1.0,
      },
      {
        url: `${baseUrl}/treasury-companies`,
        lastModified: new Date(),
        changeFrequency: 'daily', // ETH Treasury page updates daily with new holdings data
        priority: 0.9,
      },
      {
        url: `${baseUrl}/etfs`,
        lastModified: new Date(),
        changeFrequency: 'daily', // ETF data updates daily
        priority: 0.9,
      },
      {
        url: `${baseUrl}/news`,
        lastModified: new Date(),
        changeFrequency: 'daily', // News updates daily
        priority: 0.8,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/analytics/charts`,
        lastModified: new Date(),
        changeFrequency: 'daily', // Charts update with new data daily
        priority: 0.7,
      },
      {
        url: `${baseUrl}/analytics/premium-discount`,
        lastModified: new Date(),
        changeFrequency: 'daily', // Premium/discount analysis updates daily
        priority: 0.6,
      },
      {
        url: `${baseUrl}/analytics/exposure`,
        lastModified: new Date(),
        changeFrequency: 'daily', // Exposure analysis updates daily
        priority: 0.6,
      },
      {
        url: `${baseUrl}/cards`,
        lastModified: new Date(),
        changeFrequency: 'daily', // Cards page updates with live data daily
        priority: 0.7,
      },
      {
        url: `${baseUrl}/sec-filings`,
        lastModified: new Date(),
        changeFrequency: 'daily', // SEC filings updated daily
        priority: 0.8,
      },
      {
        url: `${baseUrl}/sitemap-html`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.3,
      },
    ]

    // Dynamic company pages
    const companyPages: MetadataRoute.Sitemap = companies.map((company) => ({
      url: `${baseUrl}/companies/${company.ticker}`,
      lastModified: company.lastUpdated || new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))

    return [...staticPages, ...companyPages]
    
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Fallback sitemap with static pages only
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily', // Main page updates daily with new ETH prices, holdings, news
        priority: 1.0,
      },
      {
        url: `${baseUrl}/treasury-companies`,
        lastModified: new Date(),
        changeFrequency: 'daily', // ETH Treasury page updates daily with new holdings data
        priority: 0.9,
      },
      {
        url: `${baseUrl}/etfs`,
        lastModified: new Date(),
        changeFrequency: 'daily', // ETF data updates daily
        priority: 0.9,
      },
      {
        url: `${baseUrl}/news`,
        lastModified: new Date(),
        changeFrequency: 'daily', // News updates daily
        priority: 0.8,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/analytics/charts`,
        lastModified: new Date(),
        changeFrequency: 'daily', // Charts update with new data daily
        priority: 0.7,
      },
      {
        url: `${baseUrl}/analytics/premium-discount`,
        lastModified: new Date(),
        changeFrequency: 'daily', // Premium/discount analysis updates daily
        priority: 0.6,
      },
      {
        url: `${baseUrl}/analytics/exposure`,
        lastModified: new Date(),
        changeFrequency: 'daily', // Exposure analysis updates daily
        priority: 0.6,
      },
      {
        url: `${baseUrl}/sitemap-html`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.3,
      },
      {
        url: `${baseUrl}/cards`,
        lastModified: new Date(),
        changeFrequency: 'daily', // Cards page updates with live data daily
        priority: 0.7,
      },
      {
        url: `${baseUrl}/sec-filings`,
        lastModified: new Date(),
        changeFrequency: 'daily', // SEC filings updated daily
        priority: 0.8,
      },
      // Static fallback company pages
      {
        url: `${baseUrl}/companies/BMNR`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/companies/SBET`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/companies/BTBT`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/companies/BTCS`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/companies/GAME`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/companies/ICG`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/companies/KR1`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/companies/EXOD`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/companies/BTCT`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ]
  }
}
