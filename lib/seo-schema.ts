// SEO schema and structured data utilities

// Generate organization schema
export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SALOME",
    "alternateName": "SALOME - Patungan Akun SaaS Bersama",
    "url": "https://salome.cloudfren.id",
    "logo": "https://salome.cloudfren.id/logo.png",
    "description": "Solusi Patungan Satu Software Rame - Rame. Tanpa Ribet pembayaran Tanpa susah cari teman patungan. Amanah, mudah, dan terpercaya.",
    "foundingDate": "2024",
    "founder": {
      "@type": "Organization",
      "name": "SALOME Team"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@salome.cloudfren.id",
      "availableLanguage": "Indonesian"
    },
    "sameAs": [
      "https://twitter.com/salome_id",
      "https://facebook.com/salome.cloudfren.id",
      "https://instagram.com/salome.cloudfren.id"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ID",
      "addressLocality": "Jakarta",
      "addressRegion": "DKI Jakarta"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "IDR",
      "description": "Gratis untuk bergabung"
    }
  }
}

// Generate website schema
export const generateWebsiteSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SALOME",
    "alternateName": "SALOME - Patungan Akun SaaS Bersama",
    "url": "https://salome.cloudfren.id",
    "description": "Solusi Patungan Satu Software Rame - Rame. Tanpa Ribet pembayaran Tanpa susah cari teman patungan. Amanah, mudah, dan terpercaya.",
    "publisher": {
      "@type": "Organization",
      "name": "SALOME",
      "logo": {
        "@type": "ImageObject",
        "url": "https://salome.cloudfren.id/logo.png"
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://salome.cloudfren.id/browse?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": "Aplikasi SaaS",
      "description": "Daftar aplikasi SaaS yang bisa dipatungkan"
    }
  }
}

// Generate application schema
export const generateApplicationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "SALOME",
    "alternateName": "SALOME - Patungan Akun SaaS Bersama",
    "url": "https://salome.cloudfren.id",
    "description": "Solusi Patungan Satu Software Rame - Rame. Tanpa Ribet pembayaran Tanpa susah cari teman patungan. Amanah, mudah, dan terpercaya.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareVersion": "1.0",
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "author": {
      "@type": "Organization",
      "name": "SALOME Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SALOME",
      "logo": {
        "@type": "ImageObject",
        "url": "https://salome.cloudfren.id/logo.png"
      }
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "IDR",
      "description": "Gratis untuk bergabung"
    },
    "featureList": [
      "Patungan Subscription SaaS",
      "Pembayaran Aman dengan Midtrans",
      "Sistem Pembagian Biaya Adil",
      "Berbagi Akses Aplikasi",
      "Manajemen Grup Mudah",
      "Verifikasi Keamanan",
      "Dashboard Real-time",
      "Notifikasi Otomatis"
    ],
    "screenshot": "https://salome.cloudfren.id/screenshot.png",
    "softwareHelp": "https://salome.cloudfren.id/help"
  }
}

// Generate FAQ schema
export const generateFAQSchema = (faqs: Array<{question: string, answer: string}>) => {
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

// Generate breadcrumb schema
export const generateBreadcrumbSchema = (items: Array<{name: string, url: string}>) => {
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

// Generate product schema for apps
export const generateProductSchema = (app: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": app.name,
    "description": app.description,
    "image": app.image,
    "url": `https://salome.cloudfren.id/apps/${app.id}`,
    "brand": {
      "@type": "Brand",
      "name": app.brand || "SALOME"
    },
    "category": app.category,
    "offers": {
      "@type": "Offer",
      "price": app.price || "0",
      "priceCurrency": "IDR",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "SALOME"
      }
    },
    "aggregateRating": app.rating ? {
      "@type": "AggregateRating",
      "ratingValue": app.rating,
      "reviewCount": app.reviewCount || 1
    } : undefined
  }
}

// Generate group schema
export const generateGroupSchema = (group: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "Group",
    "name": group.name,
    "description": group.description,
    "url": `https://salome.cloudfren.id/groups/${group.id}`,
    "member": {
      "@type": "Person",
      "name": "Anggota Grup"
    },
    "offers": {
      "@type": "Offer",
      "price": group.costPerPerson || "0",
      "priceCurrency": "IDR",
      "description": "Biaya per anggota"
    }
  }
}

// Generate article schema
export const generateArticleSchema = (article: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": article.image,
    "url": article.url,
    "datePublished": article.publishedTime,
    "dateModified": article.modifiedTime || article.publishedTime,
    "author": {
      "@type": "Organization",
      "name": article.author || "SALOME Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SALOME",
      "logo": {
        "@type": "ImageObject",
        "url": "https://salome.cloudfren.id/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    }
  }
}

// Generate local business schema
export const generateLocalBusinessSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "SALOME",
    "description": "Platform terpercaya untuk patungan dan sharing akun aplikasi SaaS bersama teman-teman.",
    "url": "https://salome.cloudfren.id",
    "telephone": "+62-xxx-xxx-xxxx",
    "email": "support@salome.cloudfren.id",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jakarta",
      "addressLocality": "Jakarta",
      "addressRegion": "DKI Jakarta",
      "postalCode": "12345",
      "addressCountry": "ID"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -6.2088,
      "longitude": 106.8456
    },
    "openingHours": "Mo-Su 00:00-23:59",
    "priceRange": "$$",
    "paymentAccepted": "Credit Card, Bank Transfer, E-Wallet",
    "currenciesAccepted": "IDR"
  }
}

// Generate review schema
export const generateReviewSchema = (reviews: Array<{rating: number, review: string, author: string}>) => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "SALOME",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
      "reviewCount": reviews.length
    },
    "review": reviews.map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating
      },
      "reviewBody": review.review,
      "author": {
        "@type": "Person",
        "name": review.author
      }
    }))
  }
}

// Generate event schema
export const generateEventSchema = (event: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.name,
    "description": event.description,
    "startDate": event.startDate,
    "endDate": event.endDate,
    "location": {
      "@type": "VirtualLocation",
      "url": event.url
    },
    "organizer": {
      "@type": "Organization",
      "name": "SALOME"
    },
    "offers": {
      "@type": "Offer",
      "price": event.price || "0",
      "priceCurrency": "IDR",
      "availability": "https://schema.org/InStock"
    }
  }
}

// Generate all schemas for a page
export const generateAllSchemas = (pageType: string, data: any) => {
  const schemas = []

  // Always include organization and website schemas
  schemas.push(generateOrganizationSchema())
  schemas.push(generateWebsiteSchema())

  // Add page-specific schemas
  switch (pageType) {
    case 'homepage':
      schemas.push(generateApplicationSchema())
      break
    case 'app-detail':
      if (data.app) {
        schemas.push(generateProductSchema(data.app))
      }
      break
    case 'group-detail':
      if (data.group) {
        schemas.push(generateGroupSchema(data.group))
      }
      break
    case 'article':
      if (data.article) {
        schemas.push(generateArticleSchema(data.article))
      }
      break
  }

  // Add FAQ schema if available
  if (data.faqs && data.faqs.length > 0) {
    schemas.push(generateFAQSchema(data.faqs))
  }

  // Add breadcrumb schema if available
  if (data.breadcrumbs && data.breadcrumbs.length > 0) {
    schemas.push(generateBreadcrumbSchema(data.breadcrumbs))
  }

  return schemas
}
