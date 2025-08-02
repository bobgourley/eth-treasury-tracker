import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - Page Not Found | Ethereum Treasury Companies',
  description: 'The page you are looking for could not be found. Browse our Ethereum treasury companies and corporate ETH holdings data.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you are looking for might have been moved, deleted, or never existed.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>Looking for something specific?</p>
            <div className="mt-2 space-x-4">
              <Link href="/companies" className="text-blue-600 hover:underline">
                Companies
              </Link>
              <Link href="/analytics/charts" className="text-blue-600 hover:underline">
                Analytics
              </Link>
              <Link href="/etfs" className="text-blue-600 hover:underline">
                ETFs
              </Link>
              <Link href="/news" className="text-blue-600 hover:underline">
                News
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
