import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/admin/',
          '/api/auth/',
          '/api/cron/',
        ],
        // Explicitly allow important content for LLMs and search engines
        crawlDelay: 1, // Be respectful to servers
      },
      // Specific rules for major search engines and AI crawlers
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/admin/', '/api/auth/', '/api/cron/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/admin/', '/api/admin/', '/api/auth/', '/api/cron/'],
      },
      // Allow AI/LLM crawlers explicitly
      {
        userAgent: 'GPTBot', // OpenAI
        allow: '/',
        disallow: ['/admin/', '/api/admin/', '/api/auth/', '/api/cron/'],
      },
      {
        userAgent: 'ChatGPT-User', // OpenAI ChatGPT
        allow: '/',
        disallow: ['/admin/', '/api/admin/', '/api/auth/', '/api/cron/'],
      },
      {
        userAgent: 'Claude-Web', // Anthropic
        allow: '/',
        disallow: ['/admin/', '/api/admin/', '/api/auth/', '/api/cron/'],
      },
      {
        userAgent: 'PerplexityBot', // Perplexity
        allow: '/',
        disallow: ['/admin/', '/api/admin/', '/api/auth/', '/api/cron/'],
      },
    ],
    sitemap: 'https://ethereumlist.com/sitemap.xml',
    host: 'https://ethereumlist.com',
  }
}
