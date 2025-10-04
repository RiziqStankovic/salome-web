// SEO utility functions
export const generatePageTitle = (title: string, siteName: string = 'SALOME') => {
  if (title.includes(siteName)) {
    return title
  }
  return `${title} | ${siteName}`
}

export const generateMetaDescription = (description: string, maxLength: number = 160) => {
  if (description.length <= maxLength) {
    return description
  }
  return description.substring(0, maxLength - 3) + '...'
}

export const generateKeywords = (baseKeywords: string[], additionalKeywords: string[] = []) => {
  const allKeywords = [...baseKeywords, ...additionalKeywords]
  return Array.from(new Set(allKeywords)) // Remove duplicates
}

export const generateCanonicalUrl = (path: string, baseUrl: string = 'https://salome.cloudfren.id') => {
  if (path.startsWith('http')) {
    return path
  }
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

export const generateOpenGraphImage = (image: string, baseUrl: string = 'https://salome.cloudfren.id') => {
  if (image.startsWith('http')) {
    return image
  }
  return `${baseUrl}${image.startsWith('/') ? image : `/${image}`}`
}

// Default SEO data for SALOME
export const defaultSEO = {
  siteName: 'SALOME',
  baseUrl: 'https://salome.cloudfren.id',
  defaultTitle: 'SALOME - Patungan Akun SaaS Bersama',
  defaultDescription: 'Solusi Patungan Satu Software Rame - Rame. Tanpa Ribet pembayaran Tanpa susah cari teman patungan. Amanah, mudah, dan terpercaya.',
  defaultKeywords: [
    'patungan saas',
    'sharing subscription',
    'patungan aplikasi',
    'group subscription',
    'midtrans payment',
    'indonesia',
    'hemat biaya',
    'subscription sharing',
    'patungan netflix',
    'patungan spotify',
    'patungan youtube premium',
    'patungan canva',
    'patungan adobe',
    'patungan microsoft office',
    'patungan aplikasi premium',
    'berbagi akun',
    'cost sharing',
    'subscription management'
  ],
  defaultImage: '/og-image.jpg',
  defaultFavicon: '/favicon.ico',
  twitterHandle: '@salome_id',
  locale: 'id_ID',
  type: 'website'
}

// Generate structured data for different page types
export const generateStructuredData = (type: 'website' | 'article' | 'product', data: any) => {
  const baseData = {
    "@context": "https://schema.org",
    "@type": type === 'website' ? 'WebSite' : type === 'article' ? 'Article' : 'Product',
    "name": data.name || data.title,
    "description": data.description,
    "url": data.url,
    "image": data.image,
    "author": {
      "@type": "Organization",
      "name": data.author || 'SALOME Team'
    },
    "publisher": {
      "@type": "Organization",
      "name": "SALOME",
      "logo": {
        "@type": "ImageObject",
        "url": "https://salome.cloudfren.id/favicon.ico"
      }
    }
  }

  if (type === 'article') {
    return {
      ...baseData,
      "datePublished": data.publishedTime,
      "dateModified": data.modifiedTime || data.publishedTime,
      "headline": data.title,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": data.url
      }
    }
  }

  if (type === 'product') {
    return {
      ...baseData,
      "offers": {
        "@type": "Offer",
        "price": data.price || "0",
        "priceCurrency": data.currency || "IDR",
        "availability": "https://schema.org/InStock"
      },
      "brand": {
        "@type": "Brand",
        "name": "SALOME"
      }
    }
  }

  return baseData
}

// Generate breadcrumb structured data
export const generateBreadcrumbStructuredData = (items: Array<{name: string, url: string}>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }
}

// Generate FAQ structured data
export const generateFAQStructuredData = (faqs: Array<{question: string, answer: string}>) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}
