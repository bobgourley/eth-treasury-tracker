import EtfList from '@/components/EtfList'
import FuturisticLayout from '@/components/FuturisticLayout'
import FuturisticCard from '@/components/FuturisticCard'
import styles from '@/styles/futuristic.module.css'

export async function generateMetadata() {
  return {
    title: 'Ethereum ETFs - EthereumList.com',
    description: 'Track Ethereum Exchange-Traded Funds (ETFs) and their ETH holdings, total assets under management, and key metrics.',
  }
}

export default function EtfsPage() {
  return (
    <FuturisticLayout 
      title="Ethereum ETFs" 
      showLiveIndicator={true}
    >
      {/* Page Description */}
      <div className={styles.cardGrid}>
        <FuturisticCard 
          title="ETF Overview" 
          icon="📈" 
          size="full"
          variant="info"
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Track Ethereum Exchange-Traded Funds (ETFs) and their ETH holdings, total assets under management, 
            and key performance metrics. Real-time data from institutional ETF providers.
          </p>
        </FuturisticCard>
      </div>

      {/* ETF List Component */}
      <EtfList />
    </FuturisticLayout>
  )
}
