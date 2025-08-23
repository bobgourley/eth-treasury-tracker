'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

function AdminLoginContent() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for error parameters from OAuth
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(`Authentication error: ${errorParam}`)
      console.log('❌ OAuth Error from URL:', errorParam)
    }

    // Check existing session
    if (status === 'loading') return // Still loading

    if (session?.user?.isAdmin) {
      setDebugInfo('Admin session found, redirecting...')
      router.push('/admin')
      return
    }

    if (status === 'authenticated' && !session?.user?.isAdmin) {
      setError('Your account is not authorized for admin access')
      setDebugInfo('User authenticated but not admin')
    }

    if (status === 'unauthenticated') {
      setDebugInfo('No active session')
    }
  }, [session, status, router, searchParams])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError('')
      setDebugInfo('Starting Google sign-in...')
      console.log('🚀 Starting Google OAuth sign-in')
      
      await signIn('google', { 
        callbackUrl: '/admin',
        redirect: true 
      })
      
    } catch (err) {
      console.error('💥 Sign-in exception:', err)
      setError('Sign-in failed')
      setDebugInfo(`Exception: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setDebugInfo('Clearing session...')
      await signOut({ callbackUrl: '/admin/login' })
      setError('')
      setDebugInfo('Logged out successfully')
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
            Sign in with your authorized Google account
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

          <div className="space-y-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading || status === 'loading'}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>

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
