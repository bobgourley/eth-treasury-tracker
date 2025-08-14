import Link from 'next/link'
import FuturisticLayout from '../../components/FuturisticLayout'
import FuturisticCard, { MetricDisplay } from '../../components/FuturisticCard'
import { FuturisticBadge } from '../../components/FuturisticUI'
import styles from '../../styles/futuristic.module.css'

export default function AboutPage() {
  return (
    <FuturisticLayout title="About Ethereum Treasury Tracker" showLiveIndicator={false}>
      {/* Hero Section */}
      <FuturisticCard title="Ethereum Treasury Companies" icon="🏢" size="large">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Track and analyze publicly traded companies that hold Ethereum as a strategic treasury asset.
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.125rem' }}>What We Track</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Comprehensive analytics platform tracking publicly traded companies holding Ethereum (ETH) as strategic treasury assets. 
              Real-time data, advanced analytics, and interactive visualizations for institutional adoption insights.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.125rem' }}>Data Sources</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Aggregated data from stock exchanges, blockchain networks, and company filings to provide 
              accurate and up-to-date information about corporate Ethereum holdings.
            </p>
          </div>
        </div>
      </FuturisticCard>

      {/* What are ETH Treasury Companies */}
      <FuturisticCard title="What are Ethereum Treasury Companies?" icon="Ξ" size="large">
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            <strong>Ethereum Treasury Companies</strong> are publicly traded corporations that hold Ethereum (ETH) 
            as a strategic asset on their balance sheets. These companies view ETH as:
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <h5 style={{ color: 'var(--neon-cyan)', marginBottom: '0.5rem' }}>💎 Store of Value</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>A digital asset that preserves purchasing power over time</p>
            </div>
            <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <h5 style={{ color: 'var(--neon-cyan)', marginBottom: '0.5rem' }}>📊 Treasury Diversification</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>An alternative to traditional cash and bonds</p>
            </div>
            <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <h5 style={{ color: 'var(--neon-cyan)', marginBottom: '0.5rem' }}>🛡️ Inflation Hedge</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Protection against currency debasement and inflation</p>
            </div>
            <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <h5 style={{ color: 'var(--neon-cyan)', marginBottom: '0.5rem' }}>🚀 Strategic Investment</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Exposure to the growing Ethereum ecosystem</p>
            </div>
            <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <h5 style={{ color: 'var(--neon-cyan)', marginBottom: '0.5rem' }}>⚙️ Operational Asset</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>For companies building on Ethereum infrastructure</p>
            </div>
          </div>
          
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1.5rem' }}>
            Unlike individual investors or private funds, these companies provide transparent, audited disclosure 
            of their ETH holdings through quarterly financial reports and SEC filings.
          </p>
        </div>
      </FuturisticCard>

      {/* Why only publicly traded */}
      <FuturisticCard title="Why Only Publicly Traded Companies?" icon="🏛️" size="large">
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            We focus exclusively on publicly traded companies for several important reasons:
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--card-bg)' }}>
              <h4 style={{ color: 'var(--neon-cyan)', marginBottom: '0.75rem', fontSize: '1.1rem' }}>📊 Transparency & Accountability</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Public companies must disclose material holdings in quarterly reports (10-Q) and annual reports (10-K), 
                providing verified, audited data about their ETH positions.
              </p>
            </div>
            <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--card-bg)' }}>
              <h4 style={{ color: 'var(--neon-cyan)', marginBottom: '0.75rem', fontSize: '1.1rem' }}>📈 Investment Accessibility</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Investors can gain ETH exposure through traditional stock markets without directly holding 
                cryptocurrency, making it accessible through retirement accounts and institutional portfolios.
              </p>
            </div>
            <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--card-bg)' }}>
              <h4 style={{ color: 'var(--neon-cyan)', marginBottom: '0.75rem', fontSize: '1.1rem' }}>⚖️ Regulatory Compliance</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Public companies operate under strict SEC oversight, ensuring proper custody, accounting, 
                and risk management of their digital assets.
              </p>
            </div>
            <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--card-bg)' }}>
              <h4 style={{ color: 'var(--neon-cyan)', marginBottom: '0.75rem', fontSize: '1.1rem' }}>📊 Market Impact</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Public company ETH holdings represent institutional validation and can significantly 
                influence market sentiment and adoption trends.
              </p>
            </div>
          </div>
        </div>
      </FuturisticCard>

      {/* Site Features */}
      <FuturisticCard title="Site Features & Pages" icon="🌐" size="large">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
          
          {/* Main Dashboard */}
          <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--card-bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ marginRight: '1rem', fontSize: '1.5rem' }}>📊</div>
              <div>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                  <Link href="/" style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}>Main Dashboard</Link>
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Real-time overview of all tracked companies</p>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Comprehensive overview of all tracked Ethereum treasury companies with total ETH holdings, 
              current ETH price, market statistics, and sortable company data.
            </p>
          </div>

          {/* Premium/Discount Analytics */}
          <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--card-bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ marginRight: '1rem', fontSize: '1.5rem' }}>📈</div>
              <div>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                  <Link href="/analytics/premium-discount" style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}>ETH Basis Analytics</Link>
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Identify undervalued and overvalued ETH treasury companies</p>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Advanced analytics calculating whether companies trade at premium or discount 
              to their underlying ETH holdings value for arbitrage opportunities and market efficiency analysis.
            </p>
          </div>

          {/* Charts Dashboard */}
          <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--card-bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ marginRight: '1rem', fontSize: '1.5rem' }}>📊</div>
              <div>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                  <Link href="/analytics/charts" style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}>Interactive Charts</Link>
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Visual data exploration with interactive charts</p>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Interactive visualizations including ETH Holdings Distribution charts, market share analysis, 
              and comprehensive data exploration tools for institutional adoption insights.
            </p>
          </div>

          {/* News Page */}
          <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--card-bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ marginRight: '1rem', fontSize: '1.5rem' }}>📰</div>
              <div>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                  <Link href="/news" style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}>News & Updates</Link>
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Latest news about Ethereum treasury companies</p>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Curated news feed featuring the latest developments, announcements, and market updates 
              related to companies holding Ethereum as treasury assets.
            </p>
          </div>
        </div>
      </FuturisticCard>
    </FuturisticLayout>
  )
}
