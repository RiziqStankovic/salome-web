import { generateStructuredData, generateBreadcrumbStructuredData, generateFAQStructuredData } from '@/lib/seo'

interface StructuredDataProps {
  type: 'website' | 'article' | 'product'
  data: any
}

interface BreadcrumbStructuredDataProps {
  items: Array<{name: string, url: string}>
}

interface FAQStructuredDataProps {
  faqs: Array<{question: string, answer: string}>
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = generateStructuredData(type, data)
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const structuredData = generateBreadcrumbStructuredData(items)
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function FAQStructuredData({ faqs }: FAQStructuredDataProps) {
  const structuredData = generateFAQStructuredData(faqs)
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
