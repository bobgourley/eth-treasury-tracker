'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'

function AdminLoginContent() {
  const [email, setEmail] = useState('')
  const [secret, setSecret] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check existing admin session
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/bypass-check')
        if (response.ok) {
          const data = await response.json()
          if (data.isAdmin) {
            setDebugInfo('Admin session found, redirecting...')
            router.push('/admin')
            return
          }
        }
        setDebugInfo('No active admin session')
      } catch (err) {
        console.error('Session check error:', err)
        setDebugInfo(`Session error: ${err}`)
      }
    }
    checkSession()
  }, [router])

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      setError('')
      setDebugInfo('Attempting admin login...')
      
      const response = await fetch('/api/admin/bypass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, secret }),
      })

      const data = await response.json()

      if (response.ok) {
        setDebugInfo('Admin login successful! Redirecting...')
        router.push('/admin')
      } else {
        setError(data.error || 'Login failed')
        setDebugInfo(`Login failed: ${data.error}`)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Login failed')
      setDebugInfo(`Exception: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setDebugInfo('Clearing session...')
      await fetch('/api/admin/bypass-logout', { method: 'POST' })
      setError('')
      setDebugInfo('Logged out successfully')
      router.refresh()
    } catch (err) {
      console.error('Logout error:', err)
      setError('Failed to logout')
    }
  }

  const clearAllData = () => {
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=")
      const name = eqPos > -1 ? c.substr(0, eqPos) : c
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
    })
    localStorage.clear()
    sessionStorage.clear()
    setDebugInfo('All data and cookies cleared')
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ethereum Treasury Tracker
          </h1>
          <h2 className="text-xl font-semibold text-gray-700">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your admin credentials
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Admin Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="your-admin@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="secret" className="block text-sm font-medium text-gray-700">
                Admin Secret
              </label>
              <div className="mt-1">
                <input
                  id="secret"
                  name="secret"
                  type="password"
                  required
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter admin secret"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6 flex space-x-2">
            <button
              onClick={handleLogout}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear Session
            </button>
            <button
              onClick={clearAllData}
              className="flex-1 py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              🧹 Clear All Data
            </button>
          </div>

          {debugInfo && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-sm text-gray-700">
              <strong>Debug:</strong> {debugInfo}
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Information</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Only authorized administrators can access this area.
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Contact the system administrator if you need access.
              </p>
              <p className="text-sm text-gray-500 mt-3">
                Having trouble? Try &quot;Clear All Data&quot; then sign in again.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminLogin() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminLoginContent />
    </Suspense>
  )
}
