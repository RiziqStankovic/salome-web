// SEO content optimization utilities

// Generate optimized content for different page types
export const generateOptimizedContent = (pageType: string, data: any) => {
  switch (pageType) {
    case 'homepage':
      return {
        heading: 'SALOME - Patungan Akun SaaS Bersama',
        subheading: 'Hemat hingga 90% dengan berbagi biaya aplikasi favorit bersama teman-teman',
        description: 'Solusi Patungan Satu Software Rame - Rame. Tanpa Ribet pembayaran Tanpa susah cari teman patungan. Amanah, mudah, dan terpercaya.',
        cta: 'Mulai Patungan Sekarang',
        features: [
          'Hemat hingga 90% biaya subscription',
          'Pembayaran aman dengan Midtrans',
          'Sistem pembagian biaya yang adil',
          'Berbagi akses aplikasi dengan mudah',
          'Manajemen grup yang praktis'
        ],
        benefits: [
          'Tidak perlu membayar full price untuk aplikasi premium',
          'Berbagi biaya dengan teman-teman yang terpercaya',
          'Akses ke berbagai aplikasi SaaS populer',
          'Sistem pembayaran yang aman dan terpercaya',
          'Manajemen grup yang mudah dan praktis'
        ]
      }
    
    case 'browse':
      return {
        heading: 'Jelajahi Aplikasi SaaS Favorit',
        subheading: 'Temukan aplikasi yang ingin dipatungkan bersama teman-teman',
        description: 'Jelajahi berbagai aplikasi SaaS populer yang bisa dipatungkan. Dari streaming, productivity, hingga creative tools.',
        cta: 'Cari Aplikasi',
        categories: [
          'Streaming & Entertainment',
          'Productivity & Office',
          'Creative & Design',
          'Development & Tools',
          'Communication & Social'
        ]
      }
    
    case 'groups':
      return {
        heading: 'Grup Patungan Aktif',
        subheading: 'Bergabung dengan grup yang sudah ada atau buat grup baru',
        description: 'Temukan grup patungan yang sesuai dengan kebutuhan Anda atau buat grup baru untuk berbagi biaya aplikasi favorit.',
        cta: 'Buat Grup Baru',
        benefits: [
          'Bergabung dengan grup yang sudah ada',
          'Buat grup baru dengan teman-teman',
          'Kelola pembayaran dengan mudah',
          'Pantau aktivitas grup real-time'
        ]
      }
    
    case 'group-detail':
      return {
        heading: data.name || 'Grup Patungan',
        subheading: `Patungan ${data.appName || 'aplikasi'} bersama ${data.memberCount || 0} anggota`,
        description: data.description || `Bergabung dengan grup patungan ${data.name} dan hemat biaya aplikasi favorit.`,
        cta: 'Bergabung Sekarang',
        details: {
          'Aplikasi': data.appName || 'Tidak ditentukan',
          'Anggota': `${data.memberCount || 0} orang`,
          'Biaya per orang': data.costPerPerson || 'Rp 0',
          'Durasi': data.duration || 'Bulanan',
          'Status': data.status || 'Aktif'
        }
      }
    
    case 'app-detail':
      return {
        heading: data.name || 'Aplikasi SaaS',
        subheading: `Patungan ${data.name} dan hemat hingga ${data.savings || 90}%`,
        description: `Bergabung dengan grup patungan ${data.name} dan nikmati akses penuh dengan biaya yang lebih terjangkau.`,
        cta: 'Cari Grup Patungan',
        features: data.features || [
          'Akses penuh ke semua fitur',
          'Berbagi akun dengan aman',
          'Pembayaran bulanan yang terjangkau',
          'Dukungan 24/7'
        ],
        pricing: {
          'Harga normal': data.originalPrice || 'Rp 0',
          'Harga patungan': data.sharedPrice || 'Rp 0',
          'Hemat': data.savings || '90%'
        }
      }
    
    default:
      return {
        heading: 'SALOME - Patungan Akun SaaS Bersama',
        subheading: 'Platform terpercaya untuk patungan aplikasi SaaS',
        description: 'Hemat hingga 90% dengan berbagi biaya aplikasi favorit bersama teman-teman.',
        cta: 'Mulai Sekarang'
      }
  }
}

// Generate meta descriptions for different content types
export const generateMetaDescription = (content: any, maxLength: number = 160) => {
  let description = content.description || content.subheading || content.heading
  
  if (description.length > maxLength) {
    description = description.substring(0, maxLength - 3) + '...'
  }
  
  return description
}

// Generate keywords for different content types
export const generateKeywords = (content: any, additionalKeywords: string[] = []) => {
  const baseKeywords = [
    'patungan saas',
    'sharing subscription',
    'patungan aplikasi',
    'group subscription',
    'midtrans payment',
    'indonesia',
    'hemat biaya'
  ]
  
  const contentKeywords = []
  
  if (content.heading) {
    contentKeywords.push(...content.heading.toLowerCase().split(' '))
  }
  
  if (content.subheading) {
    contentKeywords.push(...content.subheading.toLowerCase().split(' '))
  }
  
  if (content.features) {
    contentKeywords.push(...content.features.flatMap((f: string) => f.toLowerCase().split(' ')))
  }
  
  if (content.categories) {
    contentKeywords.push(...content.categories.flatMap((c: string) => c.toLowerCase().split(' ')))
  }
  
  const allKeywords = [...baseKeywords, ...contentKeywords, ...additionalKeywords]
  return Array.from(new Set(allKeywords)).filter(k => k.length > 2)
}

// Generate structured data for different content types
export const generateContentStructuredData = (pageType: string, content: any, data: any) => {
  const baseUrl = 'https://salome.id'
  
  switch (pageType) {
    case 'homepage':
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": content.heading,
        "description": content.description,
        "url": baseUrl,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${baseUrl}/browse?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "IDR",
          "description": "Gratis untuk bergabung"
        }
      }
    
    case 'browse':
      return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": content.heading,
        "description": content.description,
        "url": `${baseUrl}/browse`,
        "mainEntity": {
          "@type": "ItemList",
          "name": "Aplikasi SaaS",
          "description": "Daftar aplikasi SaaS yang bisa dipatungkan"
        }
      }
    
    case 'groups':
      return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": content.heading,
        "description": content.description,
        "url": `${baseUrl}/groups`,
        "mainEntity": {
          "@type": "ItemList",
          "name": "Grup Patungan",
          "description": "Daftar grup patungan aktif"
        }
      }
    
    case 'group-detail':
      return {
        "@context": "https://schema.org",
        "@type": "Group",
        "name": content.heading,
        "description": content.description,
        "url": `${baseUrl}/groups/${data.id}`,
        "member": {
          "@type": "Person",
          "name": "Anggota Grup"
        },
        "offers": {
          "@type": "Offer",
          "price": data.costPerPerson || "0",
          "priceCurrency": "IDR",
          "description": "Biaya per anggota"
        }
      }
    
    case 'app-detail':
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": content.heading,
        "description": content.description,
        "url": `${baseUrl}/apps/${data.id}`,
        "offers": {
          "@type": "Offer",
          "price": data.sharedPrice || "0",
          "priceCurrency": "IDR",
          "availability": "https://schema.org/InStock"
        },
        "brand": {
          "@type": "Brand",
          "name": "SALOME"
        }
      }
    
    default:
      return {}
  }
}

// Generate FAQ content for different pages
export const generateFAQContent = (pageType: string) => {
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
    },
    {
      question: "Aplikasi apa saja yang bisa dipatungkan?",
      answer: "Anda bisa mempatungkan berbagai aplikasi SaaS populer seperti Netflix, Spotify, YouTube Premium, Canva, Adobe Creative Cloud, Microsoft Office, dan banyak lagi."
    },
    {
      question: "Berapa maksimal anggota dalam satu grup?",
      answer: "Jumlah maksimal anggota dalam satu grup tergantung pada aplikasi yang dipatungkan. Biasanya antara 2-6 anggota per grup."
    }
  ]
  
  const pageSpecificFAQs = {
    browse: [
      {
        question: "Bagaimana cara mencari aplikasi yang ingin dipatungkan?",
        answer: "Gunakan fitur pencarian di halaman jelajahi aplikasi atau filter berdasarkan kategori untuk menemukan aplikasi yang Anda cari."
      },
      {
        question: "Apakah semua aplikasi bisa dipatungkan?",
        answer: "Tidak semua aplikasi bisa dipatungkan. Kami hanya menyediakan aplikasi yang mendukung sharing akun dan tidak melanggar terms of service."
      }
    ],
    groups: [
      {
        question: "Bagaimana cara membuat grup patungan baru?",
        answer: "Klik tombol 'Buat Grup Baru', pilih aplikasi yang ingin dipatungkan, tentukan jumlah anggota, dan undang teman-teman untuk bergabung."
      },
      {
        question: "Apakah saya bisa keluar dari grup kapan saja?",
        answer: "Ya, Anda bisa keluar dari grup kapan saja. Namun, pastikan untuk memberitahu anggota lain dan menyelesaikan kewajiban pembayaran terlebih dahulu."
      }
    ],
    profile: [
      {
        question: "Bagaimana cara mengubah profil saya?",
        answer: "Klik pada foto profil atau nama Anda, lalu pilih 'Edit Profil' untuk mengubah informasi pribadi Anda."
      },
      {
        question: "Apakah saya bisa mengubah email atau nomor telepon?",
        answer: "Ya, Anda bisa mengubah email dan nomor telepon di halaman pengaturan profil. Pastikan untuk memverifikasi perubahan tersebut."
      }
    ]
  }
  
  return [...commonFAQs, ...(pageSpecificFAQs[pageType as keyof typeof pageSpecificFAQs] || [])]
}

// Generate content for social media sharing
export const generateSocialContent = (pageType: string, content: any, data: any) => {
  const baseUrl = 'https://salome.id'
  
  switch (pageType) {
    case 'homepage':
      return {
        title: content.heading,
        description: content.description,
        url: baseUrl,
        image: `${baseUrl}/og-image.jpg`,
        hashtags: ['#SALOME', '#PatunganSaaS', '#HematBiaya', '#SharingSubscription']
      }
    
    case 'browse':
      return {
        title: content.heading,
        description: content.description,
        url: `${baseUrl}/browse`,
        image: `${baseUrl}/og-image.jpg`,
        hashtags: ['#JelajahiAplikasi', '#PatunganSaaS', '#AplikasiFavorit']
      }
    
    case 'groups':
      return {
        title: content.heading,
        description: content.description,
        url: `${baseUrl}/groups`,
        image: `${baseUrl}/og-image.jpg`,
        hashtags: ['#GrupPatungan', '#PatunganSaaS', '#BergabungGrup']
      }
    
    case 'group-detail':
      return {
        title: `${content.heading} - Grup Patungan`,
        description: content.description,
        url: `${baseUrl}/groups/${data.id}`,
        image: data.image || `${baseUrl}/og-image.jpg`,
        hashtags: ['#GrupPatungan', '#PatunganSaaS', '#BergabungSekarang']
      }
    
    case 'app-detail':
      return {
        title: `Patungan ${content.heading} - SALOME`,
        description: content.description,
        url: `${baseUrl}/apps/${data.id}`,
        image: data.image || `${baseUrl}/og-image.jpg`,
        hashtags: ['#PatunganSaaS', '#HematBiaya', '#AplikasiFavorit']
      }
    
    default:
      return {
        title: content.heading,
        description: content.description,
        url: baseUrl,
        image: `${baseUrl}/og-image.jpg`,
        hashtags: ['#SALOME', '#PatunganSaaS']
      }
  }
}