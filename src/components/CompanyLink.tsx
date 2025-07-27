import Link from 'next/link'

interface CompanyLinkProps {
  ticker: string
  name: string
  className?: string
  children?: React.ReactNode
}

export default function CompanyLink({ ticker, name, className = '', children }: CompanyLinkProps) {
  return (
    <Link 
      href={`/companies/${ticker}`}
      className={`hover:text-blue-600 transition-colors ${className}`}
      title={`View ${name} (${ticker}) profile`}
    >
      {children || name}
    </Link>
  )
}
