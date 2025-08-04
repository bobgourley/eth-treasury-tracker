'use client'

import React from 'react'
import FuturisticSidebar from './FuturisticSidebar'
import styles from '../styles/futuristic.module.css'

interface FuturisticLayoutProps {
  children: React.ReactNode
  title?: string
  showLiveIndicator?: boolean
  className?: string
}

export default function FuturisticLayout({ 
  children, 
  title, 
  showLiveIndicator = false,
  className = '' 
}: FuturisticLayoutProps) {
  return (
    <div className={styles.dashboardContainer}>
      <FuturisticSidebar />
      
      <main className={`${styles.mainContent} ${className}`}>
        {title && (
          <div className={styles.pageHeader}>
            <div className={styles.pageTitle}>
              <span>{title}</span>
              {showLiveIndicator && <span className={styles.liveIndicator}>LIVE</span>}
            </div>
            <div className={styles.dateDisplay}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        )}
        
        {children}
      </main>
    </div>
  )
}

// Page Header Component for consistent styling
interface PageHeaderProps {
  title: string
  subtitle?: string
  showLiveIndicator?: boolean
  actions?: React.ReactNode
}

export function PageHeader({ 
  title, 
  subtitle, 
  showLiveIndicator = false, 
  actions 
}: PageHeaderProps) {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.pageTitle}>
        <span>{title}</span>
        {showLiveIndicator && <span className={styles.liveIndicator}>LIVE</span>}
        {subtitle && <span className={styles.pageSubtitle}>{subtitle}</span>}
      </div>
      <div className={styles.pageActions}>
        {actions}
        <div className={styles.dateDisplay}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>
    </div>
  )
}
