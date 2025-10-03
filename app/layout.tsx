import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { ConfettiProvider } from '@/contexts/ConfettiContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import ChatWidget from '@/components/ChatWidget'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'SALOME - Patungan Akun SaaS Bersama',
    template: '%s | SALOME'
  },
  description: 'Platform terpercaya untuk patungan dan sharing akun aplikasi SaaS bersama teman-teman. Hemat hingga 90% dengan sistem pembagian biaya yang adil dan aman. Dukung Midtrans, aman, dan mudah digunakan.',
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
  authors: [{ name: 'SALOME Team', url: 'https://salome.id' }],
  creator: 'SALOME Team',
  publisher: 'SALOME',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://salome.id',
    siteName: 'SALOME',
    title: 'SALOME - Patungan Akun SaaS Bersama',
    description: 'Platform terpercaya untuk patungan dan sharing akun aplikasi SaaS bersama teman-teman. Hemat hingga 90% dengan sistem pembagian biaya yang adil dan aman.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SALOME - Patungan Akun SaaS Bersama',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SALOME - Patungan Akun SaaS Bersama',
    description: 'Platform terpercaya untuk patungan dan sharing akun aplikasi SaaS bersama teman-teman. Hemat hingga 90% dengan sistem pembagian biaya yang adil dan aman.',
    images: ['/og-image.jpg'],
    creator: '@salome_id',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "SALOME",
    "description": "Platform terpercaya untuk patungan dan sharing akun aplikasi SaaS bersama teman-teman. Hemat hingga 90% dengan sistem pembagian biaya yang adil dan aman.",
    "url": "https://salome.id",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "IDR",
      "description": "Gratis untuk bergabung"
    },
    "creator": {
      "@type": "Organization",
      "name": "SALOME Team"
    },
    "featureList": [
      "Patungan Subscription SaaS",
      "Pembayaran Aman dengan Midtrans",
      "Sistem Pembagian Biaya Adil",
      "Berbagi Akses Aplikasi",
      "Manajemen Grup Mudah"
    ]
  }

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <ConfettiProvider>
              {children}
              <ChatWidget />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                    borderRadius: '8px',
                  },
                  success: {
                    style: {
                      background: '#22c55e',
                    },
                  },
                  error: {
                    style: {
                      background: '#ef4444',
                    },
                  },
                }}
              />
            </ConfettiProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
