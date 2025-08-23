'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminDashboard from '@/components/AdminDashboard'
import CompanyManagement from '@/components/CompanyManagement'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'companies'>('dashboard')
  const [bypassSession, setBypassSession] = useState<{ isAdmin: boolean; email?: string } | null>(null)
  const [isCheckingBypass, setIsCheckingBypass] = useState(true)

  // Check for bypass session
  useEffect(() => {
    const checkBypassSession = async () => {
      try {
        const response = await fetch('/api/admin/bypass-check')
        if (response.ok) {
          const data = await response.json()
          console.log('Bypass check result:', data)
          setBypassSession(data)
        } else {
          console.log('Bypass check failed with status:', response.status)
        }
      } catch (error) {
        console.error('Bypass session check failed:', error)
      } finally {
        setIsCheckingBypass(false)
      }
    }
    
    checkBypassSession()
  }, [])

  useEffect(() => {
    if (status === 'loading' || isCheckingBypass) return // Still loading
    
    // Check if user is authenticated via OAuth or bypass
    const isOAuthAuthenticated = status === 'authenticated' && session?.user?.isAdmin
    const isBypassAuthenticated = bypassSession?.isAdmin
    
    console.log('Auth check:', {
      status,
      isOAuthAuthenticated,
      isBypassAuthenticated,
      sessionUser: session?.user,
      bypassSession
    })
    
    if (!isOAuthAuthenticated && !isBypassAuthenticated) {
      console.log('No valid authentication, redirecting to login')
      router.push('/admin/login')
    }
  }, [session, status, router, bypassSession, isCheckingBypass])

  const handleLogout = async () => {
    // Clear bypass session if it exists
    if (bypassSession?.isAdmin) {
      try {
        await fetch('/api/admin/bypass-logout', { method: 'POST' })
      } catch (error) {
        console.error('Failed to clear bypass session:', error)
      }
    }
    
    // Sign out of OAuth session
    await signOut({ callbackUrl: '/admin/login' })
  }

  if (status === 'loading' || isCheckingBypass) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Check if user is authenticated via OAuth or bypass
  const isOAuthAuthenticated = status === 'authenticated' && session?.user?.isAdmin
  const isBypassAuthenticated = bypassSession?.isAdmin
  
  if (!isOAuthAuthenticated && !isBypassAuthenticated) {
    return null // Will redirect to login via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Ethereum Treasury Tracker
              </h1>
              <span className="ml-4 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
                ← Back to Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Live Data Integration
              </button>
              <button
                onClick={() => setActiveTab('companies')}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                  activeTab === 'companies'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Company Management
              </button>

            </nav>
          </div>
        </div>
      </div>

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'companies' && <CompanyManagement />}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            <p>
              © 2025 Ethereum Treasury Tracker. Admin Panel - Complete Backend Management
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
