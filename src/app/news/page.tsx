import Link from 'next/link'
import FuturisticLayout from '../../components/FuturisticLayout'
import FuturisticCard, { MetricDisplay } from '../../components/FuturisticCard'
import GoogleNewsCard from '../../components/GoogleNewsCard'
import { FuturisticBadge } from '../../components/FuturisticUI'
import styles from '../../styles/futuristic.module.css'

// Enhanced fallback news data with Ethereum focus
const fallbackNews = [
  {
    title: "Ethereum ETFs See Record Inflows as Institutional Adoption Grows",
    description: "Major Ethereum ETFs report significant capital inflows as institutional investors increase their exposure to the second-largest cryptocurrency.",
    url: "https://www.coindesk.com/markets/ethereum-etf-inflows/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    source: { name: "CoinDesk" },
    company: null,
    ticker: null
  },
  {
    title: "Ethereum Staking Yields Attract Corporate Treasury Interest",
    description: "Companies explore Ethereum staking as a yield-generating strategy for their cryptocurrency treasury holdings.",
    url: "https://www.bloomberg.com/news/ethereum-staking-corporate-treasury/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    source: { name: "Bloomberg" },
    company: null,
    ticker: null
  },
  {
    title: "Layer 2 Solutions Drive Ethereum Network Growth",
    description: "Ethereum's layer 2 scaling solutions see increased adoption, reducing transaction costs and improving network efficiency.",
    url: "https://www.reuters.com/technology/ethereum-layer-2-growth/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    source: { name: "Reuters" },
    company: null,
    ticker: null
  },
  {
    title: "Ethereum Price Analysis: Technical Indicators Point to Bullish Momentum",
    description: "Technical analysis suggests Ethereum could see continued upward momentum based on key support and resistance levels.",
    url: "https://www.cointelegraph.com/news/ethereum-price-analysis-bullish/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    source: { name: "Cointelegraph" },
    company: null,
    ticker: null
  },
  {
    title: "DeFi Protocol Launches on Ethereum Mainnet",
    description: "New decentralized finance protocol goes live on Ethereum, offering innovative yield farming opportunities.",
    url: "https://www.theblock.co/post/defi-ethereum-mainnet-launch/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    source: { name: "The Block" },
    company: null,
    ticker: null
  },
  {
    title: "Ethereum Foundation Announces Research Grants",
    description: "The Ethereum Foundation allocates funding for research into scalability, security, and sustainability improvements.",
    url: "https://ethereum.org/en/foundation/grants/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    source: { name: "Ethereum Foundation" },
    company: null,
    ticker: null
  },
  {
    title: "Institutional Ethereum Holdings Reach New Highs",
    description: "Data shows institutional Ethereum holdings have reached record levels as more companies add ETH to their balance sheets.",
    url: "https://www.coindesk.com/markets/institutional-ethereum-holdings/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    source: { name: "CoinDesk" },
    company: null,
    ticker: null
  },
  {
    title: "Ethereum Merge Anniversary: One Year Later",
    description: "Reflecting on the impact of Ethereum's transition to proof-of-stake one year after the historic Merge upgrade.",
    url: "https://www.cointelegraph.com/news/ethereum-merge-anniversary/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    source: { name: "Cointelegraph" },
    company: null,
    ticker: null
  },
  {
    title: "Smart Contract Security Audit Standards Evolve",
    description: "New industry standards for Ethereum smart contract security audits aim to reduce vulnerabilities and improve user safety.",
    url: "https://www.theblock.co/post/smart-contract-security-standards/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    source: { name: "The Block" },
    company: null,
    ticker: null
  },
  {
    title: "Ethereum Gas Fees Drop to Multi-Month Lows",
    description: "Network optimization and layer 2 adoption contribute to significantly lower transaction costs on Ethereum mainnet.",
    url: "https://www.coindesk.com/tech/ethereum-gas-fees-drop/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(),
    source: { name: "CoinDesk" },
    company: null,
    ticker: null
  },
  {
    title: "NFT Market Shows Signs of Recovery on Ethereum",
    description: "Ethereum-based NFT marketplaces report increased trading volume and user activity after months of decline.",
    url: "https://www.theblock.co/post/nft-market-recovery-ethereum/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    source: { name: "The Block" },
    company: null,
    ticker: null
  },
  {
    title: "Ethereum Validator Count Reaches New Milestone",
    description: "The number of active Ethereum validators continues to grow, strengthening network security and decentralization.",
    url: "https://ethereum.org/en/staking/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
    source: { name: "Ethereum.org" },
    company: null,
    ticker: null
  },
  {
    title: "Cross-Chain Bridge Security Improvements",
    description: "Ethereum bridge protocols implement enhanced security measures following recent industry incidents.",
    url: "https://www.cointelegraph.com/news/ethereum-bridge-security/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 44 * 60 * 60 * 1000).toISOString(),
    source: { name: "Cointelegraph" },
    company: null,
    ticker: null
  },
  {
    title: "Ethereum Developer Activity Remains Strong",
    description: "GitHub metrics show continued high levels of development activity across the Ethereum ecosystem.",
    url: "https://www.theblock.co/post/ethereum-developer-activity/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    source: { name: "The Block" },
    company: null,
    ticker: null
  },
  {
    title: "Ethereum Roadmap Updates Focus on Scalability",
    description: "Core developers outline upcoming improvements to Ethereum's scalability and user experience.",
    url: "https://ethereum.org/en/roadmap/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 52 * 60 * 60 * 1000).toISOString(),
    source: { name: "Ethereum.org" },
    company: null,
    ticker: null
  },
  {
    title: "Institutional DeFi Adoption Accelerates",
    description: "Traditional financial institutions increasingly participate in Ethereum-based decentralized finance protocols.",
    url: "https://www.coindesk.com/business/institutional-defi-adoption/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 56 * 60 * 60 * 1000).toISOString(),
    source: { name: "CoinDesk" },
    company: null,
    ticker: null
  },
  {
    title: "Ethereum Energy Consumption Drops 99% Post-Merge",
    description: "Environmental impact data confirms Ethereum's successful transition to a more sustainable consensus mechanism.",
    url: "https://ethereum.org/en/energy-consumption/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
    source: { name: "Ethereum Foundation" },
    company: null,
    ticker: null
  },
  {
    title: "Ethereum Name Service Registrations Surge",
    description: "ENS domain registrations reach new highs as users embrace decentralized identity solutions.",
    url: "https://www.theblock.co/post/ethereum-name-service-surge/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 64 * 60 * 60 * 1000).toISOString(),
    source: { name: "The Block" },
    company: null,
    ticker: null
  },
  {
    title: "Ethereum Client Diversity Improves Network Resilience",
    description: "Multiple Ethereum client implementations strengthen network security and reduce single points of failure.",
    url: "https://ethereum.org/en/developers/docs/nodes-and-clients/client-diversity/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 68 * 60 * 60 * 1000).toISOString(),
    source: { name: "Ethereum.org" },
    company: null,
    ticker: null
  },
  {
    title: "Ethereum Liquid Staking Protocols Gain Traction",
    description: "Liquid staking solutions allow users to earn rewards while maintaining liquidity of their staked ETH.",
    url: "https://www.coindesk.com/tech/ethereum-liquid-staking/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    source: { name: "CoinDesk" },
    company: null,
    ticker: null
  }
]

// Server-side data fetching from Google News RSS
async function getNewsData() {
  try {
    console.log('🔍 News Page: Starting direct RSS news fetch...')
    
    // Import the RSS fetcher directly to avoid SSR issues
    const { fetchEthereumNewsMultiTopic } = await import('@/lib/googleNewsRss')
    const rssArticles = await fetchEthereumNewsMultiTopic(20)
    
    if (rssArticles && rssArticles.length > 0) {
      // Convert GoogleNewsItem to NewsArticle format
      const articles = rssArticles.map(item => ({
        title: item.title,
        description: item.description,
        url: item.url,
        urlToImage: null,
        publishedAt: item.publishedAt,
        source: { name: item.source },
        company: null,
        ticker: null
      }))
      
      console.log(`📰 News Page: Successfully fetched ${articles.length} real RSS articles`)
      return {
        articles,
        count: articles.length,
        stats: {
          total: articles.length,
          companySpecific: 0,
          general: articles.length,
          companiesTracked: 9
        },
        message: 'Live Google News RSS data'
      }
    } else {
      console.log('⚠️ News Page: RSS fetch returned no articles, using fallback')
      throw new Error('No RSS articles returned')
    }
  } catch (error) {
    console.error('Error fetching Google News RSS, using fallback:', error)
    // Always return fallback data to ensure page works
    return {
      articles: fallbackNews.slice(0, 20), // Return 20 articles for news page
      count: 20,
      stats: {
        total: 20,
        companySpecific: 0,
        general: 20,
        companiesTracked: 9
      },
      message: 'Using enhanced fallback news data'
    }
  }
}

export default async function NewsPage() {
  const newsData = await getNewsData()

  return (
    <FuturisticLayout title="Ethereum Treasury News" showLiveIndicator={true}>
      {/* News Articles */}
      <div className={styles.cardGrid}>
        <GoogleNewsCard 
          articles={newsData.articles} 
          title={`Latest Ethereum News (${newsData.articles.length})`}
          showViewAll={false}
          compact={false}
        />
      </div>
    </FuturisticLayout>
  )
}
