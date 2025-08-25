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
  btcPrice: number
  totalEthSupply: number
}

export default function CardsPage() {
  const [cardData, setCardData] = useState<CardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Refs for each card to capture as PNG
  const companySummaryRef = useRef<HTMLDivElement>(null)
  const etfSummaryRef = useRef<HTMLDivElement>(null)
  const ethBtcComparisonRef = useRef<HTMLDivElement>(null)
  const ethTreasuryPercentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        setLoading(true)
        
        const [companiesResponse, etfsResponse, metricsResponse] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/etfs'),
          fetch('/api/metrics')
        ])
        
        if (!companiesResponse.ok || !etfsResponse.ok || !metricsResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const [companiesData, etfsData, metricsData] = await Promise.all([
          companiesResponse.json(),
          etfsResponse.json(),
          metricsResponse.json()
        ])

        setCardData({
          companies: companiesData.companies || [],
          etfs: etfsData.etfs || [],
          ethPrice: metricsData.ethPrice || 3680,
          btcPrice: metricsData.bitcoinPrice || 61000,
          totalEthSupply: metricsData.ethSupply || 120500000
        })
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
      const { default: html2canvas } = await import('html2canvas')
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
    }
  }

  if (loading) {
    return (
      <FuturisticLayout title="Shareable Cards" showLiveIndicator={false}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading card data...</p>
        </div>
      </FuturisticLayout>
    )
  }

  if (error || !cardData) {
    return (
      <FuturisticLayout title="Shareable Cards" showLiveIndicator={false}>
        <div className={styles.errorContainer}>
          <p>Error: {error || 'No data available'}</p>
        </div>
      </FuturisticLayout>
    )
  }

  const { companies, etfs, ethPrice, btcPrice, totalEthSupply } = cardData
  const totalCompanyEth = companies.reduce((sum, company) => sum + company.ethHoldings, 0)
  const totalEtfEth = etfs.reduce((sum, etf) => sum + etf.ethHoldings, 0)
  const totalEth = totalCompanyEth + totalEtfEth
  const ethSupplyPercentage = (totalEth / totalEthSupply) * 100

  return (
    <FuturisticLayout title="Shareable Cards" showLiveIndicator={false}>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <span>🎴</span>
          <span>Shareable Cards</span>
        </div>
        <p className={styles.pageDescription} style={{ marginTop: '1rem', marginBottom: '2rem' }}>
          Generate ready-to-share PNG cards with key statistics from the Ethereum Treasury Tracker
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            overflow: 'hidden',
            marginBottom: '1rem'
          }}>
            <div 
              ref={companySummaryRef} 
              style={{ 
                width: '1200px', 
                height: '630px', 
                padding: '60px', 
                background: 'linear-gradient(135deg, #0F1419 0%, #1A1F2E 100%)', 
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                transform: 'scale(0.4)',
                transformOrigin: 'center center'
              }}
            >
              <h2 style={{ 
                color: '#00D9FF', 
                fontSize: '3rem', 
                marginBottom: '2rem', 
                textAlign: 'center', 
                letterSpacing: '1px', 
                fontWeight: 'bold',
                textShadow: '0 0 20px rgba(0, 217, 255, 0.3)'
              }}>
                Treasury Strategy Companies
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
                <div>
                  <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#00D9FF', marginBottom: '0.5rem' }}>{companies.length}</div>
                  <div style={{ color: '#8B949E', fontSize: '1.2rem', letterSpacing: '0.3px' }}>Active Companies</div>
                </div>
                <div>
                  <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#7C3AED', marginBottom: '0.5rem' }}>
                    {(totalCompanyEth / 1000000).toFixed(1)}M
                  </div>
                  <div style={{ color: '#8B949E', fontSize: '1.2rem' }}>Total ETH Holdings</div>
                </div>
                <div>
                  <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#10B981', marginBottom: '0.5rem' }}>
                    ${(totalCompanyEth * ethPrice / 1000000000).toFixed(1)}B
                  </div>
                  <div style={{ color: '#8B949E', fontSize: '1.2rem' }}>Total Value (USD)</div>
                </div>
                <div>
                  <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#F59E0B', marginBottom: '0.5rem' }}>
                    {((totalCompanyEth / totalEthSupply) * 100).toFixed(3)}%
                  </div>
                  <div style={{ color: '#8B949E', fontSize: '1.2rem' }}>of ETH Supply</div>
                </div>
              </div>
              
              <div style={{ 
                position: 'absolute',
                bottom: '30px',
                left: '60px',
                right: '60px',
                textAlign: 'center', 
                color: '#8B949E', 
                fontSize: '1rem',
                borderTop: '1px solid #21262D',
                paddingTop: '20px'
              }}>
                EthereumList.com • {new Date().toLocaleDateString()}
              </div>
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
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            overflow: 'hidden',
            marginBottom: '1rem'
          }}>
            <div 
              ref={etfSummaryRef} 
              style={{ 
                width: '1200px', 
                height: '630px', 
                padding: '60px', 
                background: 'linear-gradient(135deg, #0F1419 0%, #1A1F2E 100%)', 
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                transform: 'scale(0.4)',
                transformOrigin: 'center center'
              }}
            >
              <h2 style={{ 
                color: '#00D9FF', 
                fontSize: '3rem', 
                marginBottom: '2rem', 
                textAlign: 'center', 
                letterSpacing: '1px', 
                fontWeight: 'bold',
                textShadow: '0 0 20px rgba(0, 217, 255, 0.3)'
              }}>
                Ethereum ETFs
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
                <div>
                  <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#00D9FF', marginBottom: '0.5rem' }}>{etfs.length}</div>
                  <div style={{ color: '#8B949E', fontSize: '1.2rem', letterSpacing: '0.3px' }}>Active ETFs</div>
                </div>
                <div>
                  <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#7C3AED', marginBottom: '0.5rem' }}>
                    {(totalEtfEth / 1000000).toFixed(1)}M
                  </div>
                  <div style={{ color: '#8B949E', fontSize: '1.2rem' }}>Total ETH Holdings</div>
                </div>
                <div>
                  <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#10B981', marginBottom: '0.5rem' }}>
                    ${(totalEtfEth * ethPrice / 1000000000).toFixed(1)}B
                  </div>
                  <div style={{ color: '#8B949E', fontSize: '1.2rem' }}>Total Value (USD)</div>
                </div>
                <div>
                  <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#F59E0B', marginBottom: '0.5rem' }}>
                    {((totalEtfEth / totalEthSupply) * 100).toFixed(3)}%
                  </div>
                  <div style={{ color: '#8B949E', fontSize: '1.2rem' }}>of ETH Supply</div>
                </div>
              </div>
              
              <div style={{ 
                position: 'absolute',
                bottom: '30px',
                left: '60px',
                right: '60px',
                textAlign: 'center', 
                color: '#8B949E', 
                fontSize: '1rem',
                borderTop: '1px solid #21262D',
                paddingTop: '20px'
              }}>
                EthereumList.com • {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </FuturisticCard>

        {/* ETH/BTC Comparison Card */}
        <FuturisticCard 
          title="ETH/BTC Comparison Card" 
          icon="⚖️"
          actions={
            <button 
              onClick={() => downloadCard(ethBtcComparisonRef, 'eth-btc-comparison')}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md cursor-pointer transition-colors"
            >
              Download PNG
            </button>
          }
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            overflow: 'hidden',
            marginBottom: '1rem'
          }}>
            <div 
              ref={ethBtcComparisonRef} 
              style={{ 
                width: '1200px', 
                height: '630px', 
                padding: '60px', 
                background: 'linear-gradient(135deg, #0F1419 0%, #1A1F2E 100%)', 
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                transform: 'scale(0.4)',
                transformOrigin: 'center center'
              }}
            >
              <h2 style={{ 
                color: '#00D9FF', 
                fontSize: '2.5rem', 
                marginBottom: '2rem', 
                textAlign: 'center', 
                letterSpacing: '1px', 
                fontWeight: 'bold',
                textShadow: '0 0 20px rgba(0, 217, 255, 0.3)'
              }}>
                ETH vs BTC Market Comparison
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', color: '#00D9FF', marginBottom: '1rem', fontWeight: 'bold' }}>ETHEREUM (ETH)</div>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#627EEA', marginBottom: '1rem' }}>
                    ${ethPrice.toLocaleString()}
                  </div>
                  <div style={{ color: '#8B949E', fontSize: '1rem' }}>Current Price</div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', color: '#F7931A', marginBottom: '1rem', fontWeight: 'bold' }}>BITCOIN (BTC)</div>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#F7931A', marginBottom: '1rem' }}>
                    ${btcPrice.toLocaleString()}
                  </div>
                  <div style={{ color: '#8B949E', fontSize: '1rem' }}>Current Price</div>
                </div>
              </div>

              <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'rgba(0, 217, 255, 0.1)', borderRadius: '8px', border: '1px solid rgba(0, 217, 255, 0.2)' }}>
                <div style={{ fontSize: '1.2rem', color: '#00D9FF', marginBottom: '1rem' }}>Price Ratio</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FFFFFF' }}>
                  1 BTC = {(btcPrice / ethPrice).toFixed(2)} ETH
                </div>
              </div>

              <div style={{ marginTop: '1rem', textAlign: 'center', color: '#8B949E', fontSize: '0.8rem' }}>
                EthereumList.com • {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </FuturisticCard>

        {/* ETH Treasury Percentage Card */}
        <FuturisticCard 
          title="Corporate ETH Treasury Holdings" 
          icon="🏢"
          actions={
            <button 
              onClick={() => downloadCard(ethTreasuryPercentRef, 'eth-treasury-percentage')}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md cursor-pointer transition-colors"
            >
              Download PNG
            </button>
          }
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            overflow: 'hidden',
            marginBottom: '1rem'
          }}>
            <div 
              ref={ethTreasuryPercentRef} 
              style={{ 
                width: '1200px', 
                height: '630px', 
                padding: '60px', 
                background: 'linear-gradient(135deg, #0F1419 0%, #1A1F2E 100%)', 
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                transform: 'scale(0.4)',
                transformOrigin: 'center center'
              }}
            >
              <h2 style={{ 
                color: '#00D9FF', 
                fontSize: '2.5rem', 
                marginBottom: '2rem', 
                textAlign: 'center', 
                letterSpacing: '1px', 
                fontWeight: 'bold',
                textShadow: '0 0 20px rgba(0, 217, 255, 0.3)'
              }}>
                Corporate ETH Treasury Holdings
              </h2>
              
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ 
                  fontSize: '8rem', 
                  fontWeight: 'bold', 
                  color: '#10B981',
                  textShadow: '0 0 30px rgba(16, 185, 129, 0.4)',
                  marginBottom: '1rem'
                }}>
                  {ethSupplyPercentage.toFixed(3)}%
                </div>
                <div style={{ fontSize: '1.5rem', color: '#8B949E', marginBottom: '2rem' }}>
                  of Total Ethereum Supply
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00D9FF', marginBottom: '0.5rem' }}>
                    {(totalEth / 1000000).toFixed(1)}M
                  </div>
                  <div style={{ color: '#8B949E', fontSize: '1rem' }}>Total ETH Tracked</div>
                </div>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#7C3AED', marginBottom: '0.5rem' }}>
                    {companies.length + etfs.length}
                  </div>
                  <div style={{ color: '#8B949E', fontSize: '1rem' }}>Companies + ETFs</div>
                </div>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#F59E0B', marginBottom: '0.5rem' }}>
                    ${(totalEth * ethPrice / 1000000000).toFixed(1)}B
                  </div>
                  <div style={{ color: '#8B949E', fontSize: '1rem' }}>Total USD Value</div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', textAlign: 'center', color: '#8B949E', fontSize: '0.8rem' }}>
                EthereumList.com • {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </FuturisticCard>
      </div>

      {/* Footer */}
      <div className="space-y-8">
        <p>Generate and download PNG cards for social media sharing • All data sourced from live APIs</p>
      </div>
    </FuturisticLayout>
  )
}
