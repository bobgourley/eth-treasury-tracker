'use client'

import React, { useEffect, useState, useRef } from 'react'
import FuturisticLayout from '@/components/FuturisticLayout'
import FuturisticCard, { MetricDisplay } from '@/components/FuturisticCard'
import { FuturisticBadge } from '@/components/FuturisticUI'
import styles from '@/styles/futuristic.module.css'

interface Company {
  id: number
  name: string
  ticker: string
  ethHoldings: number
  marketCap: string
  isActive: boolean
}

interface Etf {
  id: number
  symbol: string
  name: string
  ethHoldings: number
  aum: number
  isActive: boolean
}

interface CardData {
  companies: Company[]
  etfs: Etf[]
  ethPrice: number
  totalEthSupply: number
}

export default function CardsPage() {
  const [cardData, setCardData] = useState<CardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Refs for each card to capture as PNG
  const companySummaryRef = useRef<HTMLDivElement>(null)
  const etfSummaryRef = useRef<HTMLDivElement>(null)
  const companyListRef = useRef<HTMLDivElement>(null)
  const etfListRef = useRef<HTMLDivElement>(null)
  const marketShareRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        setLoading(true)
        
        const [companiesResponse, etfsResponse, metricsResponse] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/etfs'),
          fetch('/api/metrics')
        ])
        
        const companiesData = companiesResponse.ok ? await companiesResponse.json() : { companies: [] }
        const etfsData = etfsResponse.ok ? await etfsResponse.json() : { etfs: [] }
        const metricsData = metricsResponse.ok ? await metricsResponse.json() : { ethPrice: 3500, totalEthSupply: 120000000 }
        
        setCardData({
          companies: companiesData.companies || [],
          etfs: etfsData.etfs || [],
          ethPrice: metricsData.ethPrice || 3500,
          totalEthSupply: metricsData.totalEthSupply || 120000000
        })
        
        setError(null)
      } catch (err) {
        console.error('Error fetching card data:', err)
        setError('Failed to load card data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchCardData()
  }, [])

  const downloadCard = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!ref.current) return
    
    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default
      
      const canvas = await html2canvas(ref.current, {
        backgroundColor: '#0F1419',
        scale: 2,
        useCORS: true,
        allowTaint: true
      })
      
      const link = document.createElement('a')
      link.download = `${filename}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('Error generating PNG:', error)
      alert('Error generating PNG. Please try again.')
    }
  }

  if (loading) {
    return (
      <FuturisticLayout title="Shareable Cards" showLiveIndicator={true}>
        <FuturisticCard title="Loading..." icon="⏳">
          <div className="text-center">
            <p>Loading card data...</p>
          </div>
        </FuturisticCard>
      </FuturisticLayout>
    )
  }

  if (error || !cardData) {
    return (
      <FuturisticLayout title="Shareable Cards" showLiveIndicator={true}>
        <FuturisticCard title="Error" icon="❌" variant="warning">
          <div className="text-center">
            <p>{error || 'Failed to load card data'}</p>
            <p className="text-sm mt-1">Please try refreshing the page</p>
          </div>
        </FuturisticCard>
      </FuturisticLayout>
    )
  }

  const { companies, etfs, ethPrice, totalEthSupply } = cardData
  
  const totalCompanyEth = companies.reduce((sum, c) => sum + (c.ethHoldings || 0), 0)
  const totalEtfEth = etfs.reduce((sum, e) => sum + (e.ethHoldings || 0), 0)
  const totalTrackedEth = totalCompanyEth + totalEtfEth
  const trackedPercentage = (totalTrackedEth / totalEthSupply) * 100

  return (
    <FuturisticLayout title="Shareable Cards" showLiveIndicator={true}>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <span>🎴</span>
          <span>Shareable Cards</span>
        </div>
        <p className={styles.pageDescription}>
          Generate ready-to-share PNG cards with key statistics from the Ethereum Treasury Tracker
        </p>
      </div>

      <div className={styles.cardGrid}>
        {/* Company Summary Card */}
        <FuturisticCard 
          title="Company Summary Card" 
          icon="🏢"
          actions={
            <button 
              onClick={() => downloadCard(companySummaryRef, 'company-summary')}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md cursor-pointer transition-colors"
            >
              Download PNG
            </button>
          }
        >
          <div ref={companySummaryRef} style={{ padding: '2rem', background: '#0F1419', borderRadius: '12px' }}>
            <h2 style={{ color: '#00D9FF', fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>
              Treasury Strategy Companies
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00D9FF' }}>{companies.length}</div>
                <div style={{ color: '#8B949E', fontSize: '0.9rem' }}>Active Companies</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7C3AED' }}>
                  {(totalCompanyEth / 1000000).toFixed(1)}M
                </div>
                <div style={{ color: '#8B949E', fontSize: '0.9rem' }}>Total ETH Holdings</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F97316' }}>
                  ${(totalCompanyEth * ethPrice / 1000000000).toFixed(2)}B
                </div>
                <div style={{ color: '#8B949E', fontSize: '0.9rem' }}>USD Value</div>
              </div>
            </div>
            <div style={{ marginTop: '1rem', textAlign: 'center', color: '#8B949E', fontSize: '0.8rem' }}>
              EthereumList.com • {new Date().toLocaleDateString()}
            </div>
          </div>
        </FuturisticCard>

        {/* ETF Summary Card */}
        <FuturisticCard 
          title="ETF Summary Card" 
          icon="📈"
          actions={
            <button 
              onClick={() => downloadCard(etfSummaryRef, 'etf-summary')}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md cursor-pointer transition-colors"
            >
              Download PNG
            </button>
          }
        >
          <div ref={etfSummaryRef} style={{ padding: '2rem', background: '#0F1419', borderRadius: '12px' }}>
            <h2 style={{ color: '#00D9FF', fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>
              Ethereum ETFs
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00D9FF' }}>{etfs.length}</div>
                <div style={{ color: '#8B949E', fontSize: '0.9rem' }}>Active ETFs</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7C3AED' }}>
                  {(totalEtfEth / 1000000).toFixed(1)}M
                </div>
                <div style={{ color: '#8B949E', fontSize: '0.9rem' }}>Total ETH Holdings</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F97316' }}>
                  ${(totalEtfEth * ethPrice / 1000000000).toFixed(1)}B
                </div>
                <div style={{ color: '#8B949E', fontSize: '0.9rem' }}>USD Value</div>
              </div>
            </div>
            <div style={{ marginTop: '1rem', textAlign: 'center', color: '#8B949E', fontSize: '0.8rem' }}>
              EthereumList.com • {new Date().toLocaleDateString()}
            </div>
          </div>
        </FuturisticCard>

        {/* Company List Card */}
        <FuturisticCard 
          title="Company List Card" 
          icon="📋"
          size="large"
          actions={
            <button 
              onClick={() => downloadCard(companyListRef, 'company-list')}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md cursor-pointer transition-colors"
            >
              Download PNG
            </button>
          }
        >
          <div ref={companyListRef} style={{ padding: '2rem', background: '#0F1419', borderRadius: '12px', minHeight: '400px' }}>
            <h2 style={{ color: '#00D9FF', fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              Treasury Strategy Companies
            </h2>
            <div style={{ marginBottom: '1.5rem' }}>
              {companies.slice(0, 8).map((company, index) => (
                <div key={company.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: index < 7 ? '1px solid #21262D' : 'none'
                }}>
                  <div style={{ color: '#E6EDF3' }}>
                    <span style={{ fontWeight: 'bold' }}>{company.name}</span>
                    <span style={{ color: '#8B949E', marginLeft: '0.5rem' }}>({company.ticker})</span>
                  </div>
                  <div style={{ color: '#7C3AED', fontWeight: 'bold' }}>
                    {((company.ethHoldings || 0) / 1000).toFixed(0)}K ETH
                  </div>
                </div>
              ))}
            </div>
            <div style={{ 
              borderTop: '2px solid #00D9FF', 
              paddingTop: '1rem', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ color: '#E6EDF3', fontWeight: 'bold', fontSize: '1.1rem' }}>
                Total ({companies.length} companies)
              </div>
              <div style={{ color: '#00D9FF', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {(totalCompanyEth / 1000000).toFixed(1)}M ETH
              </div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              marginTop: '1rem', 
              color: '#8B949E', 
              fontSize: '0.9rem' 
            }}>
              {trackedPercentage.toFixed(3)}% of total ETH supply
            </div>
            <div style={{ marginTop: '1rem', textAlign: 'center', color: '#8B949E', fontSize: '0.8rem' }}>
              EthereumList.com • {new Date().toLocaleDateString()}
            </div>
          </div>
        </FuturisticCard>

        {/* ETF List Card */}
        <FuturisticCard 
          title="ETF List Card" 
          icon="📊"
          size="large"
          actions={
            <button 
              onClick={() => downloadCard(etfListRef, 'etf-list')}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md cursor-pointer transition-colors"
            >
              Download PNG
            </button>
          }
        >
          <div ref={etfListRef} style={{ padding: '2rem', background: '#0F1419', borderRadius: '12px', minHeight: '400px' }}>
            <h2 style={{ color: '#00D9FF', fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              Ethereum ETFs
            </h2>
            <div style={{ marginBottom: '1.5rem' }}>
              {etfs.slice(0, 8).map((etf, index) => (
                <div key={etf.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: index < 7 ? '1px solid #21262D' : 'none'
                }}>
                  <div style={{ color: '#E6EDF3' }}>
                    <span style={{ fontWeight: 'bold' }}>{etf.name || etf.symbol}</span>
                    <span style={{ color: '#8B949E', marginLeft: '0.5rem' }}>({etf.symbol})</span>
                  </div>
                  <div style={{ color: '#F97316', fontWeight: 'bold' }}>
                    {((etf.ethHoldings || 0) / 1000).toFixed(0)}K ETH
                  </div>
                </div>
              ))}
            </div>
            <div style={{ 
              borderTop: '2px solid #00D9FF', 
              paddingTop: '1rem', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ color: '#E6EDF3', fontWeight: 'bold', fontSize: '1.1rem' }}>
                Total ({etfs.length} ETFs)
              </div>
              <div style={{ color: '#00D9FF', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {(totalEtfEth / 1000000).toFixed(1)}M ETH
              </div>
            </div>
            <div style={{ marginTop: '1rem', textAlign: 'center', color: '#8B949E', fontSize: '0.8rem' }}>
              EthereumList.com • {new Date().toLocaleDateString()}
            </div>
          </div>
        </FuturisticCard>

        {/* Market Share Distribution Card */}
        <FuturisticCard 
          title="Market Share Card" 
          icon="🥧"
          size="large"
          actions={
            <button 
              onClick={() => downloadCard(marketShareRef, 'market-share')}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md cursor-pointer transition-colors"
            >
              Download PNG
            </button>
          }
        >
          <div ref={marketShareRef} style={{ padding: '2rem', background: '#0F1419', borderRadius: '12px', minHeight: '400px' }}>
            <h2 style={{ color: '#00D9FF', fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              ETH Holdings Distribution
            </h2>
            
            {/* Simplified chart representation */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{ 
                width: '200px', 
                height: '200px', 
                borderRadius: '50%', 
                background: `conic-gradient(
                  #7C3AED 0deg ${(totalCompanyEth / totalTrackedEth) * 360}deg,
                  #F97316 ${(totalCompanyEth / totalTrackedEth) * 360}deg 360deg
                )`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{ 
                  background: '#0F1419', 
                  borderRadius: '50%', 
                  width: '120px', 
                  height: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ color: '#00D9FF', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {(totalTrackedEth / 1000000).toFixed(1)}M
                  </div>
                  <div style={{ color: '#8B949E', fontSize: '0.8rem' }}>Total ETH</div>
                </div>
              </div>
              
              <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', background: '#7C3AED', borderRadius: '2px' }}></div>
                  <span style={{ color: '#E6EDF3', fontSize: '0.9rem' }}>
                    Companies ({((totalCompanyEth / totalTrackedEth) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', background: '#F97316', borderRadius: '2px' }}></div>
                  <span style={{ color: '#E6EDF3', fontSize: '0.9rem' }}>
                    ETFs ({((totalEtfEth / totalTrackedEth) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            <div style={{ 
              textAlign: 'center', 
              color: '#8B949E', 
              fontSize: '0.9rem',
              marginBottom: '1rem'
            }}>
              {trackedPercentage.toFixed(3)}% of total ETH supply tracked
            </div>
            
            <div style={{ marginTop: '1rem', textAlign: 'center', color: '#8B949E', fontSize: '0.8rem' }}>
              EthereumList.com • {new Date().toLocaleDateString()}
            </div>
          </div>
        </FuturisticCard>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p>Generate and download PNG cards for social media sharing • All data sourced from live APIs</p>
      </div>
    </FuturisticLayout>
  )
}
