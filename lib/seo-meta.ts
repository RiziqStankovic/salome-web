// SEO meta tags utilities

// Generate meta tags for different page types
export const generateMetaTags = (pageType: string, data: any) => {
  const baseUrl = 'https://salome.cloudfren.id'
  
  switch (pageType) {
    case 'homepage':
      return {
        title: 'SALOME - Patungan Akun SaaS Bersama',
         description: 'Solusi Patungan Satu Software Rame - Rame. Tanpa Ribet pembayaran Tanpa susah cari teman patungan. Amanah, mudah, dan terpercaya.',
        keywords: [
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
          'patungan microsoft office'
        ],
        canonical: baseUrl,
        ogImage: `${baseUrl}/og-image.jpg`,
        ogType: 'website',
        twitterCard: 'summary_large_image',
        twitterSite: '@salome_id',
        twitterCreator: '@salome_id'
      }
    
    case 'browse':
      return {
        title: 'Jelajahi Aplikasi SaaS - SALOME',
        description: 'Jelajahi berbagai aplikasi SaaS populer yang bisa dipatungkan. Dari streaming, productivity, hingga creative tools. Temukan aplikasi favorit Anda dan hemat hingga 90%.',
        keywords: [
          'browse aplikasi',
          'jelajahi aplikasi',
          'aplikasi saas',
          'patungan aplikasi',
          'netflix',
          'spotify',
          'youtube premium',
          'canva',
          'adobe',
          'microsoft office',
          'aplikasi premium',
          'berbagi akun'
        ],
        canonical: `${baseUrl}/browse`,
        ogImage: `${baseUrl}/og-image.jpg`,
        ogType: 'website',
        twitterCard: 'summary_large_image'
      }
    
    case 'groups':
      return {
        title: 'Grup Patungan Aktif - SALOME',
        description: 'Bergabung dengan grup patungan yang sudah ada atau buat grup baru untuk berbagi biaya aplikasi favorit. Kelola pembayaran dengan mudah dan pantau aktivitas grup real-time.',
        keywords: [
          'grup patungan',
          'join grup',
          'buat grup',
          'patungan grup',
          'sharing grup',
          'grup aplikasi',
          'kelola grup',
          'pembayaran grup'
        ],
        canonical: `${baseUrl}/groups`,
        ogImage: `${baseUrl}/og-image.jpg`,
        ogType: 'website',
        twitterCard: 'summary_large_image'
      }
    
    case 'group-detail':
      return {
        title: `${data.name} - Grup Patungan SALOME`,
        description: `Bergabung dengan grup patungan ${data.name}. ${data.description || 'Patungan aplikasi SaaS bersama teman-teman dan hemat biaya.'} Kelola pembayaran dengan mudah.`,
        keywords: [
          'grup patungan',
          data.name,
          'join grup',
          'patungan aplikasi',
          'sharing subscription',
          'bergabung grup',
          'pembayaran grup'
        ],
        canonical: `${baseUrl}/groups/${data.id}`,
        ogImage: data.image || `${baseUrl}/og-image.jpg`,
        ogType: 'website',
        twitterCard: 'summary_large_image'
      }
    
    case 'app-detail':
      return {
        title: `Patungan ${data.name} - SALOME`,
        description: `Patungan ${data.name} bersama teman-teman dan hemat hingga ${data.savings || 90}%. Akses penuh dengan biaya yang lebih terjangkau. Bergabung dengan grup patungan sekarang.`,
        keywords: [
          'patungan',
          data.name,
          'sharing subscription',
          'hemat biaya',
          'patungan aplikasi',
          'group subscription',
          'bergabung grup',
          'aplikasi premium'
        ],
        canonical: `${baseUrl}/apps/${data.id}`,
        ogImage: data.image || `${baseUrl}/og-image.jpg`,
        ogType: 'website',
        twitterCard: 'summary_large_image'
      }
    
    case 'profile':
      return {
        title: 'Profil Saya - SALOME',
        description: 'Kelola profil dan pengaturan akun SALOME Anda. Ubah informasi pribadi, verifikasi email, dan atur preferensi notifikasi.',
        keywords: [
          'profil',
          'pengaturan',
          'akun',
          'profile',
          'settings',
          'kelola profil',
          'verifikasi email'
        ],
        canonical: `${baseUrl}/profile`,
        ogImage: `${baseUrl}/og-image.jpg`,
        ogType: 'website',
        twitterCard: 'summary'
      }
    
    case 'dashboard':
      return {
        title: 'Dashboard - SALOME',
        description: 'Kelola grup patungan, pantau aktivitas, dan lihat riwayat pembayaran. Dashboard lengkap untuk mengatur semua aktivitas patungan Anda.',
        keywords: [
          'dashboard',
          'kelola grup',
          'pantau aktivitas',
          'riwayat pembayaran',
          'manajemen grup',
          'aktivitas patungan'
        ],
        canonical: `${baseUrl}/dashboard`,
        ogImage: `${baseUrl}/og-image.jpg`,
        ogType: 'website',
        twitterCard: 'summary'
      }
    
    default:
      return {
        title: 'SALOME - Patungan Akun SaaS Bersama',
        description: 'Platform terpercaya untuk patungan dan sharing akun aplikasi SaaS bersama teman-teman.',
        keywords: ['patungan saas', 'sharing subscription'],
        canonical: baseUrl,
        ogImage: `${baseUrl}/og-image.jpg`,
        ogType: 'website',
        twitterCard: 'summary_large_image'
      }
  }
}

// Generate Open Graph meta tags
export const generateOpenGraphTags = (meta: any) => {
  return {
    'og:type': meta.ogType || 'website',
    'og:title': meta.title,
    'og:description': meta.description,
    'og:url': meta.canonical,
    'og:image': meta.ogImage,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:alt': meta.title,
    'og:site_name': 'SALOME',
    'og:locale': 'id_ID'
  }
}

// Generate Twitter Card meta tags
export const generateTwitterCardTags = (meta: any) => {
  return {
    'twitter:card': meta.twitterCard || 'summary_large_image',
    'twitter:title': meta.title,
    'twitter:description': meta.description,
    'twitter:image': meta.ogImage,
    'twitter:image:alt': meta.title,
    'twitter:site': meta.twitterSite || '@salome_id',
    'twitter:creator': meta.twitterCreator || '@salome_id'
  }
}

// Generate additional meta tags
export const generateAdditionalMetaTags = (meta: any) => {
  return {
    'robots': 'index, follow',
    'googlebot': 'index, follow',
    'bingbot': 'index, follow',
    'language': 'Indonesian',
    'revisit-after': '7 days',
    'distribution': 'global',
    'rating': 'general',
    'author': 'SALOME Team',
    'publisher': 'SALOME',
    'copyright': 'SALOME',
    'theme-color': '#3B82F6',
    'msapplication-TileColor': '#3B82F6',
    'msapplication-TileImage': '/mstile-144x144.png',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'SALOME',
    'mobile-web-app-capable': 'yes',
    'application-name': 'SALOME'
  }
}

// Generate all meta tags for a page
export const generateAllMetaTags = (pageType: string, data: any) => {
  const meta = generateMetaTags(pageType, data)
  const ogTags = generateOpenGraphTags(meta)
  const twitterTags = generateTwitterCardTags(meta)
  const additionalTags = generateAdditionalMetaTags(meta)
  
  return {
    ...meta,
    ...ogTags,
    ...twitterTags,
    ...additionalTags
  }
}

// Generate meta tags for social sharing
export const generateSocialMetaTags = (pageType: string, data: any) => {
  const meta = generateMetaTags(pageType, data)
  
  return {
    title: meta.title,
    description: meta.description,
    url: meta.canonical,
    image: meta.ogImage,
    type: meta.ogType,
    siteName: 'SALOME',
    locale: 'id_ID'
  }
}

// Generate meta tags for search engines
export const generateSearchEngineMetaTags = (pageType: string, data: any) => {
  const meta = generateMetaTags(pageType, data)
  
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords.join(', '),
    canonical: meta.canonical,
    robots: 'index, follow',
    language: 'Indonesian',
    author: 'SALOME Team',
    publisher: 'SALOME'
  }
}

// Validate meta tags
export const validateMetaTags = (meta: any) => {
  const errors: string[] = []
  
  if (!meta.title || meta.title.length < 30) {
    errors.push('Title harus minimal 30 karakter')
  }
  
  if (meta.title && meta.title.length > 60) {
    errors.push('Title sebaiknya maksimal 60 karakter')
  }
  
  if (!meta.description || meta.description.length < 120) {
    errors.push('Description harus minimal 120 karakter')
  }
  
  if (meta.description && meta.description.length > 160) {
    errors.push('Description sebaiknya maksimal 160 karakter')
  }
  
  if (!meta.keywords || meta.keywords.length < 3) {
    errors.push('Keywords harus minimal 3 kata kunci')
  }
  
  if (!meta.canonical) {
    errors.push('Canonical URL harus ada')
  }
  
  if (!meta.ogImage) {
    errors.push('Open Graph image harus ada')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Generate meta tags for different devices
export const generateDeviceSpecificMetaTags = (meta: any) => {
  return {
    // Mobile specific
    'viewport': 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'SALOME',
    
    // Desktop specific
    'application-name': 'SALOME',
    'msapplication-TileColor': '#3B82F6',
    'msapplication-TileImage': '/mstile-144x144.png',
    'msapplication-config': '/browserconfig.xml',
    
    // General
    'theme-color': '#3B82F6',
    'msapplication-navbutton-color': '#3B82F6'
  }
}
