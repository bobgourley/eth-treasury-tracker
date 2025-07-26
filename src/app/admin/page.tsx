'use client'

import { useState, useEffect } from 'react'
import AdminLogin from '@/components/AdminLogin'
import AdminDashboard from '@/components/AdminDashboard'
import CompanyManagement from '@/components/CompanyManagement'
import ApiKeyManagement from '@/components/ApiKeyManagement'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'companies' | 'api-keys'>('dashboard')

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/admin/auth')
      const result = await response.json()
      setIsAuthenticated(result.authenticated)
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' })
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />
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
              <a
                href="/"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Dashboard
              </a>
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
              <button
                onClick={() => setActiveTab('api-keys')}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                  activeTab === 'api-keys'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                API Key Management
              </button>
            </nav>
          </div>
        </div>
      </div>

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'companies' && <CompanyManagement />}
          {activeTab === 'api-keys' && <ApiKeyManagement />}
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
