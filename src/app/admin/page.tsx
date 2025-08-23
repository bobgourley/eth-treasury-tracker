'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminDashboard from '@/components/AdminDashboard'
import CompanyManagement from '@/components/CompanyManagement'

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'companies'>('dashboard')
  const [adminSession, setAdminSession] = useState<{ isAdmin: boolean; email?: string } | null>(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  // Check for admin session
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const response = await fetch('/api/admin/bypass-check')
        if (response.ok) {
          const data = await response.json()
          console.log('Admin session check result:', data)
          setAdminSession(data)
        } else {
          console.log('Admin session check failed with status:', response.status)
        }
      } catch (error) {
        console.error('Admin session check failed:', error)
      } finally {
        setIsCheckingSession(false)
      }
    }
    
    checkAdminSession()
  }, [])

  useEffect(() => {
    if (isCheckingSession) return // Still loading
    
    if (!adminSession?.isAdmin) {
      console.log('No valid admin authentication, redirecting to login')
      router.push('/admin/login')
    }
  }, [router, adminSession, isCheckingSession])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/bypass-logout', { method: 'POST' })
      console.log('Admin session cleared')
      window.location.href = '/admin/login'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/admin/login'
    }
  }

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!adminSession?.isAdmin) {
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
