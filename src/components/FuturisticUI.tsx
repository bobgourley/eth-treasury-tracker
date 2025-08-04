import React from 'react'
import styles from '../styles/futuristic.module.css'

// Futuristic Button Component
interface FuturisticButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  className?: string
}

export function FuturisticButton({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className = ''
}: FuturisticButtonProps) {
  const variantClass = {
    primary: styles.btnPrimary,
    secondary: styles.btnSecondary,
    danger: styles.btnDanger,
    ghost: styles.btnGhost
  }[variant]

  const sizeClass = {
    small: styles.btnSmall,
    medium: styles.btnMedium,
    large: styles.btnLarge
  }[size]

  return (
    <button
      className={`${styles.futuristicBtn} ${variantClass} ${sizeClass} ${className} ${loading ? styles.btnLoading : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <span className={styles.loadingSpinner}>⟳</span>}
      {children}
    </button>
  )
}

// Futuristic Input Component
interface FuturisticInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search'
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  error?: string
  label?: string
  icon?: React.ReactNode
  className?: string
}

export function FuturisticInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  label,
  icon,
  className = ''
}: FuturisticInputProps) {
  return (
    <div className={`${styles.inputGroup} ${className}`}>
      {label && <label className={styles.inputLabel}>{label}</label>}
      <div className={`${styles.inputWrapper} ${error ? styles.inputError : ''}`}>
        {icon && <span className={styles.inputIcon}>{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={styles.futuristicInput}
        />
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  )
}

// Futuristic Badge Component
interface FuturisticBadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'live'
  size?: 'small' | 'medium' | 'large'
  pulse?: boolean
  className?: string
}

export function FuturisticBadge({
  children,
  variant = 'default',
  size = 'medium',
  pulse = false,
  className = ''
}: FuturisticBadgeProps) {
  const variantClass = {
    default: styles.badgeDefault,
    success: styles.badgeSuccess,
    warning: styles.badgeWarning,
    danger: styles.badgeDanger,
    info: styles.badgeInfo,
    live: styles.badgeLive
  }[variant]

  const sizeClass = {
    small: styles.badgeSmall,
    medium: styles.badgeMedium,
    large: styles.badgeLarge
  }[size]

  return (
    <span className={`${styles.futuristicBadge} ${variantClass} ${sizeClass} ${pulse ? styles.badgePulse : ''} ${className}`}>
      {children}
    </span>
  )
}

// Futuristic Table Component
interface FuturisticTableProps {
  headers: string[]
  data: Array<Record<string, any>>
  loading?: boolean
  onRowClick?: (row: Record<string, any>) => void
  className?: string
}

export function FuturisticTable({
  headers,
  data,
  loading = false,
  onRowClick,
  className = ''
}: FuturisticTableProps) {
  if (loading) {
    return (
      <div className={`${styles.futuristicTable} ${className}`}>
        <div className={styles.tableLoading}>
          <span className={styles.loadingSpinner}>⟳</span>
          Loading data...
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.futuristicTable} ${className}`}>
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} className={styles.tableHeader}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className={`${styles.tableRow} ${onRowClick ? styles.tableRowClickable : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {headers.map((header, cellIndex) => (
                <td key={cellIndex} className={styles.tableCell}>
                  {row[header.toLowerCase().replace(/\s+/g, '')] || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  text?: string
  className?: string
}

export function LoadingSpinner({
  size = 'medium',
  text,
  className = ''
}: LoadingSpinnerProps) {
  const sizeClass = {
    small: styles.spinnerSmall,
    medium: styles.spinnerMedium,
    large: styles.spinnerLarge
  }[size]

  return (
    <div className={`${styles.loadingContainer} ${className}`}>
      <span className={`${styles.loadingSpinner} ${sizeClass}`}>⟳</span>
      {text && <span className={styles.loadingText}>{text}</span>}
    </div>
  )
}
