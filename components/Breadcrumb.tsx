import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { generateBreadcrumbStructuredData } from '@/lib/seo'

interface BreadcrumbItem {
  name: string
  url: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  // Generate structured data
  const structuredData = generateBreadcrumbStructuredData(items)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <nav className={`flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 ${className}`} aria-label="Breadcrumb">
        <Link
          href="/"
          className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <Home className="w-4 h-4 mr-1" />
          <span>Beranda</span>
        </Link>
        
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-1">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {item.current ? (
              <span className="text-gray-900 dark:text-white font-medium" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.url}
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  )
}
