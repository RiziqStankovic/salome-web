// SEO utility functions

// Generate sitemap data
export const generateSitemapData = () => {
  const baseUrl = 'https://salome.cloudfren.id'
  const currentDate = new Date().toISOString()
  
  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: `${baseUrl}/groups`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.7
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.5
    },
    {
      url: `${baseUrl}/help`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.2
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.2
    }
  ]
}

// Generate robots.txt content
export const generateRobotsTxt = () => {
  return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /static/
Disallow: /verify-email
Disallow: /private/

Sitemap: https://salome.cloudfren.id/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Allow specific bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /`
}

// Generate manifest.json content
export const generateManifestJson = () => {
  return {
    name: 'SALOME - Patungan Akun SaaS Bersama',
    short_name: 'SALOME',
    description: 'Solusi Patungan Satu Software Rame - Rame. Tanpa Ribet pembayaran Tanpa susah cari teman patungan. Amanah, mudah, dan terpercaya.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3B82F6',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon'
      },
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml'
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png'
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    categories: ['business', 'finance', 'productivity'],
    lang: 'id',
    dir: 'ltr',
    scope: '/',
    id: 'salome-app'
  }
}

// Generate browserconfig.xml content
export const generateBrowserConfigXml = () => {
  return `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/mstile-150x150.png"/>
            <TileColor>#3B82F6</TileColor>
        </tile>
    </msapplication>
</browserconfig>`
}

// Generate preconnect links
export const generatePreconnectLinks = () => {
  return [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://salome.cloudfren.id',
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com'
  ]
}

// Generate DNS prefetch links
export const generateDnsPrefetchLinks = () => {
  return [
    '//fonts.googleapis.com',
    '//fonts.gstatic.com',
    '//salome.cloudfren.id',
    '//www.google-analytics.com',
    '//www.googletagmanager.com'
  ]
}

// Generate critical CSS
export const generateCriticalCSS = () => {
  return `
    /* Critical CSS for above-the-fold content */
    * {
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #fff;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    .header {
      background: #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 80px 0;
      text-align: center;
    }
    
    .hero h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }
    
    .hero p {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background: #3B82F6;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      transition: background 0.3s ease;
    }
    
    .btn:hover {
      background: #2563EB;
    }
    
    @media (max-width: 768px) {
      .hero h1 {
        font-size: 2rem;
      }
      
      .hero p {
        font-size: 1rem;
      }
    }
  `
}

// Generate service worker content
export const generateServiceWorker = () => {
  return `
    const CACHE_NAME = 'salome-v1';
    const urlsToCache = [
      '/',
      '/browse',
      '/groups',
      '/dashboard',
      '/profile',
      '/static/css/main.css',
      '/static/js/main.js',
      '/favicon.ico',
      '/og-image.jpg'
    ];

    self.addEventListener('install', (event) => {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then((cache) => cache.addAll(urlsToCache))
      );
    });

    self.addEventListener('fetch', (event) => {
      event.respondWith(
        caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            return fetch(event.request);
          }
        )
      );
    });
  `
}

// Generate meta tags for different page types
export const generatePageMetaTags = (pageType: string, data: any) => {
  const baseUrl = 'https://salome.cloudfren.id'
  
  const metaTemplates = {
    homepage: {
      title: 'SALOME - Patungan Akun SaaS Bersama',
      description: 'Solusi Patungan Satu Software Rame - Rame. Tanpa Ribet pembayaran Tanpa susah cari teman patungan. Amanah, mudah, dan terpercaya.',
      keywords: ['patungan saas', 'sharing subscription', 'patungan aplikasi', 'group subscription', 'midtrans payment', 'indonesia', 'hemat biaya']
    },
    browse: {
      title: 'Jelajahi Aplikasi SaaS - SALOME',
      description: 'Jelajahi berbagai aplikasi SaaS populer yang bisa dipatungkan. Dari streaming, productivity, hingga creative tools.',
      keywords: ['browse aplikasi', 'jelajahi aplikasi', 'aplikasi saas', 'patungan aplikasi', 'netflix', 'spotify', 'youtube premium']
    },
    groups: {
      title: 'Grup Patungan Aktif - SALOME',
      description: 'Bergabung dengan grup patungan yang sudah ada atau buat grup baru untuk berbagi biaya aplikasi favorit.',
      keywords: ['grup patungan', 'join grup', 'buat grup', 'patungan grup', 'sharing grup', 'grup aplikasi']
    }
  }
  
  const template = metaTemplates[pageType as keyof typeof metaTemplates] || metaTemplates.homepage
  
  return {
    title: template.title,
    description: template.description,
    keywords: template.keywords.join(', '),
    canonical: `${baseUrl}/${pageType === 'homepage' ? '' : pageType}`,
    ogImage: `${baseUrl}/og-image.jpg`,
    ogType: 'website',
    twitterCard: 'summary_large_image'
  }
}

// Generate structured data for different page types
export const generatePageStructuredData = (pageType: string, data: any) => {
  const baseUrl = 'https://salome.cloudfren.id'
  
  const structuredDataTemplates = {
    homepage: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "SALOME",
      "description": "Platform terpercaya untuk patungan dan sharing akun aplikasi SaaS bersama teman-teman.",
      "url": baseUrl,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${baseUrl}/browse?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    browse: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Jelajahi Aplikasi",
      "description": "Jelajahi berbagai aplikasi SaaS yang bisa dipatungkan.",
      "url": `${baseUrl}/browse`
    },
    groups: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Grup Patungan",
      "description": "Bergabung dengan grup patungan atau buat grup baru.",
      "url": `${baseUrl}/groups`
    }
  }
  
  return structuredDataTemplates[pageType as keyof typeof structuredDataTemplates] || structuredDataTemplates.homepage
}

// Generate breadcrumb data
export const generateBreadcrumbData = (pathname: string, data?: any) => {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = [{ name: 'Beranda', url: '/' }]
  
  let currentPath = ''
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    let name = segment
    if (segment === 'browse') name = 'Jelajahi Aplikasi'
    else if (segment === 'groups') name = 'Grup Patungan'
    else if (segment === 'profile') name = 'Profil Saya'
    else if (segment === 'settings') name = 'Pengaturan'
    else if (segment === 'dashboard') name = 'Dashboard'
    else if (data && data.name) name = data.name
    else name = segment.charAt(0).toUpperCase() + segment.slice(1)
    
    breadcrumbs.push({
      name,
      url: currentPath
    })
  })
  
  return breadcrumbs
}

// Generate FAQ data
export const generateFAQData = (pageType: string) => {
  const commonFAQs = [
    {
      question: "Apa itu SALOME?",
      answer: "SALOME adalah platform terpercaya untuk patungan dan sharing akun aplikasi SaaS bersama teman-teman. Dengan SALOME, Anda bisa hemat hingga 90% dengan sistem pembagian biaya yang adil dan aman."
    },
    {
      question: "Bagaimana cara bergabung dengan grup patungan?",
      answer: "Anda bisa bergabung dengan grup patungan yang sudah ada atau membuat grup baru. Pilih aplikasi yang ingin dipatungkan, tentukan jumlah anggota, dan mulailah berbagi biaya."
    },
    {
      question: "Apakah aman untuk berpatungan di SALOME?",
      answer: "Ya, SALOME menggunakan sistem pembayaran yang aman dengan Midtrans dan memiliki sistem verifikasi yang ketat untuk memastikan keamanan transaksi."
    }
  ]
  
  const pageSpecificFAQs = {
    browse: [
      {
        question: "Aplikasi apa saja yang bisa dipatungkan?",
        answer: "Anda bisa mempatungkan berbagai aplikasi SaaS populer seperti Netflix, Spotify, YouTube Premium, Canva, Adobe Creative Cloud, Microsoft Office, dan banyak lagi."
      }
    ],
    groups: [
      {
        question: "Berapa maksimal anggota dalam satu grup?",
        answer: "Jumlah maksimal anggota dalam satu grup tergantung pada aplikasi yang dipatungkan. Biasanya antara 2-6 anggota per grup."
      }
    ]
  }
  
  return [...commonFAQs, ...(pageSpecificFAQs[pageType as keyof typeof pageSpecificFAQs] || [])]
}

// Generate social sharing data
export const generateSocialSharingData = (pageType: string, data: any) => {
  const baseUrl = 'https://salome.cloudfren.id'
  
  const socialTemplates = {
    homepage: {
      title: 'SALOME - Patungan Akun SaaS Bersama',
      description: 'Solusi Patungan Satu Software Rame - Rame. Tanpa Ribet pembayaran Tanpa susah cari teman patungan. Amanah, mudah, dan terpercaya.',
      url: baseUrl,
      image: `${baseUrl}/og-image.jpg`,
      hashtags: ['#SALOME', '#PatunganSaaS', '#HematBiaya', '#SharingSubscription']
    },
    browse: {
      title: 'Jelajahi Aplikasi SaaS - SALOME',
      description: 'Jelajahi berbagai aplikasi SaaS populer yang bisa dipatungkan. Dari streaming, productivity, hingga creative tools.',
      url: `${baseUrl}/browse`,
      image: `${baseUrl}/og-image.jpg`,
      hashtags: ['#JelajahiAplikasi', '#PatunganSaaS', '#AplikasiFavorit']
    },
    groups: {
      title: 'Grup Patungan Aktif - SALOME',
      description: 'Bergabung dengan grup patungan yang sudah ada atau buat grup baru untuk berbagi biaya aplikasi favorit.',
      url: `${baseUrl}/groups`,
      image: `${baseUrl}/og-image.jpg`,
      hashtags: ['#GrupPatungan', '#PatunganSaaS', '#BergabungGrup']
    }
  }
  
  return socialTemplates[pageType as keyof typeof socialTemplates] || socialTemplates.homepage
}
