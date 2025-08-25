'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from '../styles/futuristic.module.css'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: <span>🏠</span>
  },
  {
    href: '/treasury-companies',
    label: 'Companies',
    icon: <span>🏢</span>
  },
  {
    href: '/etfs',
    label: 'ETFs',
    icon: <span>📈</span>
  },
  {
    href: '/news',
    label: 'News',
    icon: <span>📰</span>
  },
  {
    href: '/analytics/charts',
    label: 'Analytics',
    icon: <span>📊</span>
  },
  {
    href: '/cards',
    label: 'Cards',
    icon: <span>🎴</span>
  },
  {
    href: '/about',
    label: 'About',
    icon: <span>ℹ️</span>
  }
]

export default function FuturisticSidebar() {
  const pathname = usePathname()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>Ξ</div>
          Ethereum List
        </div>
      </div>
      
      <nav>
        <ul className={styles.navMenu}>
          {navItems.map((item) => (
            <li key={item.href} className={styles.navItem}>
              <Link 
                href={item.href}
                className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
