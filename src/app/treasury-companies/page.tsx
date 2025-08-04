import CompanyList from '@/components/CompanyList'
import FuturisticLayout from '@/components/FuturisticLayout'
import FuturisticCard from '@/components/FuturisticCard'
import { FuturisticButton } from '@/components/FuturisticUI'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import styles from '@/styles/futuristic.module.css'
import { ArrowRight } from 'lucide-react'

export async function generateMetadata() {
  return {
    title: 'ETH Treasury Companies - EthereumList.com',
    description: 'Track public companies holding Ethereum in their treasury reserves. Real-time data on ETH holdings, market caps, and financial metrics.',
  }
}

export default async function TreasuryCompaniesPage() {
  // Server-side data fetching for better performance
  let companyData = null
  let ethPrice = 3825.95
  
  try {
    // Get companies from database
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      orderBy: { ethHoldings: 'desc' }
    })

    // Get ETH price from ecosystem summary
    const ecosystemSummary = await prisma.ecosystemSummary.findFirst({
      orderBy: { lastUpdated: 'desc' }
    })
    
    if (ecosystemSummary) {
      ethPrice = ecosystemSummary.ethPrice
    }

    // Serialize company data
    if (companies && companies.length > 0) {
      companyData = {
        companies: companies.map((company) => ({
          ...company,
          marketCap: company.marketCap?.toString(),
          sharesOutstanding: company.sharesOutstanding?.toString(),
          ethValue: (company.ethHoldings || 0) * ethPrice,
        })),
        count: companies.length,
        ethPrice,
        message: 'Companies data from database'
      }
    }
  } catch (error) {
    console.error('Error fetching company data for SSR:', error)
  }
  return (
    <FuturisticLayout 
      title="ETH Treasury Companies" 
      showLiveIndicator={true}
    >
      {/* Page Description */}
      <div className={styles.cardGrid}>
        <FuturisticCard 
          title="Treasury Companies Overview" 
          icon="🏢" 
          size="full"
          variant="info"
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Track public companies holding Ethereum in their treasury reserves. Real-time data on ETH holdings, 
            market caps, financial metrics, and institutional adoption trends.
          </p>
        </FuturisticCard>
      </div>

      {/* Company List Component */}
      <CompanyList />
      
      {/* Advanced Analysis Tools */}
      <div className={styles.cardGrid}>
        <FuturisticCard 
          title="Advanced Treasury Analysis" 
          icon="📊" 
          size="full"
          variant="default"
        >
          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {/* ETH Basis Analysis */}
            <div style={{ 
              padding: '1.5rem', 
              border: '1px solid var(--border-primary)', 
              borderRadius: '12px',
              background: 'var(--bg-secondary)',
              transition: 'all 0.3s ease'
            }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
                ETH Basis Analysis
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Analyze premium/discount ratios and market-to-NAV relationships for ETH treasury companies. 
                Track how stock prices compare to underlying ETH holdings value.
              </p>
              <Link href="/analytics/premium-discount">
                <FuturisticButton variant="secondary" size="small">
                  View Analysis
                  <ArrowRight size={16} />
                </FuturisticButton>
              </Link>
            </div>
            
            {/* ETH Exposure Analysis */}
            <div style={{ 
              padding: '1.5rem', 
              border: '1px solid var(--border-primary)', 
              borderRadius: '12px',
              background: 'var(--bg-secondary)',
              transition: 'all 0.3s ease'
            }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
                ETH Exposure Analysis
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Examine ETH exposure ratios, holdings concentration, and portfolio allocation strategies 
                across different treasury companies and market segments.
              </p>
              <Link href="/analytics/exposure">
                <FuturisticButton variant="secondary" size="small">
                  View Analysis
                  <ArrowRight size={16} />
                </FuturisticButton>
              </Link>
            </div>
          </div>
        </FuturisticCard>
      </div>
    </FuturisticLayout>
  )
}
