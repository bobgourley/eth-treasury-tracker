import Link from 'next/link'

interface NavigationProps {
  title: string
  currentPage?: string
}

export default function Navigation({ title, currentPage }: NavigationProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{title}</h1>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3 text-xs text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>•</span>
            <Link href="/treasury-companies" className="hover:text-blue-600 transition-colors">
              ETH Treasury
            </Link>
            <span>•</span>
            <Link href="/etfs" className="hover:text-blue-600 transition-colors">
              ETFs
            </Link>
            <span>•</span>
            <Link href="/news" className="hover:text-blue-600 transition-colors">
              News
            </Link>
            <span>•</span>
            <Link href="/about" className="hover:text-blue-600 transition-colors">
              About
            </Link>
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition-colors px-2 py-1 bg-gray-100 rounded">
              Home
            </Link>
            <Link href="/treasury-companies" className="hover:text-blue-600 transition-colors px-2 py-1 bg-gray-100 rounded">
              ETH Treasury
            </Link>
            <Link href="/etfs" className="hover:text-blue-600 transition-colors px-2 py-1 bg-gray-100 rounded">
              ETFs
            </Link>
            <Link href="/news" className="hover:text-blue-600 transition-colors px-2 py-1 bg-gray-100 rounded">
              News
            </Link>
            <Link href="/about" className="hover:text-blue-600 transition-colors px-2 py-1 bg-gray-100 rounded">
              About
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
