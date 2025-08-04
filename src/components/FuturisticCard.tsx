import React from 'react'
import styles from '../styles/futuristic.module.css'

interface FuturisticCardProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
  size?: 'normal' | 'large' | 'wide'
}

export default function FuturisticCard({ 
  title, 
  icon, 
  children, 
  className = '',
  size = 'normal'
}: FuturisticCardProps) {
  const sizeClass = size === 'large' ? styles.cardLarge : size === 'wide' ? styles.cardWide : ''
  
  return (
    <div className={`${styles.card} ${sizeClass} ${className}`}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          {icon && <span className={styles.cardIcon}>{icon}</span>}
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

// Metric Display Component
interface MetricDisplayProps {
  value: string | number
  label: string
  subtext?: string
  color?: 'cyan' | 'blue' | 'green' | 'orange' | 'red'
  showProgress?: boolean
  progressValue?: number
}

export function MetricDisplay({ 
  value, 
  label, 
  subtext, 
  color = 'cyan',
  showProgress = false,
  progressValue = 0
}: MetricDisplayProps) {
  const colorMap = {
    cyan: 'var(--neon-cyan)',
    blue: 'var(--neon-blue)', 
    green: 'var(--neon-green)',
    orange: 'var(--neon-orange)',
    red: 'var(--neon-red)'
  }

  return (
    <div>
      <div className={styles.cardValue} style={{ color: colorMap[color] }}>
        {value}
      </div>
      <div className={styles.cardSubtext}>{label}</div>
      {subtext && <div className={styles.cardDescription}>{subtext}</div>}
      {showProgress && (
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ 
              width: `${progressValue}%`,
              background: `linear-gradient(90deg, ${colorMap[color]}, ${colorMap[color]}aa)`
            }}
          />
        </div>
      )}
    </div>
  )
}

// Status Indicator Component
interface StatusIndicatorProps {
  status: 'active' | 'warning' | 'error'
  label: string
}

export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span className={`${styles.statusDot} ${styles[status]}`} />
      <span className={styles.dataListLabel}>{label}</span>
    </div>
  )
}

// Data List Component
interface DataListProps {
  items: Array<{
    label: string
    value: string | number
    status?: 'active' | 'warning' | 'error'
  }>
}

export function DataList({ items }: DataListProps) {
  return (
    <ul className={styles.dataList}>
      {items.map((item, index) => (
        <li key={index} className={styles.dataListItem}>
          <span className={styles.dataListLabel}>
            {item.status && <span className={`${styles.statusDot} ${styles[item.status]}`} />}
            {item.label}
          </span>
          <span className={styles.dataListValue}>{item.value}</span>
        </li>
      ))}
    </ul>
  )
}
