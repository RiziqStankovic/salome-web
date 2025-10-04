import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { ConfettiProvider } from '@/contexts/ConfettiContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import ChatWidget from '@/components/ChatWidget'
import Favicon from '@/components/Favicon'
import { initializePerformanceOptimizations } from '@/lib/performance'
import { initializeAnalytics, trackPerformance, trackSessionDuration } from '@/lib/analytics'
import { initializeSEOMonitoring } from '@/lib/seo-monitoring'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'SALOME - Patungan Akun SaaS Bersama',
    template: '%s | SALOME'
  },
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
  authors: [{ name: 'SALOME Team', url: 'https://salome.cloudfren.id' }],
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
    url: 'https://salome.cloudfren.id',
    siteName: 'SALOME',
    title: 'SALOME - Patungan Akun SaaS Bersama',
    description: 'Solusi Patungan Satu Software Rame - Rame. Tanpa Ribet pembayaran Tanpa susah cari teman patungan. Amanah, mudah, dan terpercaya.',
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
    description: 'Solusi Patungan Satu Software Rame - Rame. Tanpa Ribet pembayaran Tanpa susah cari teman patungan. Amanah, mudah, dan terpercaya.',
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
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'your-google-verification-code',
  },
  other: {
    'msapplication-TileColor': '#3B82F6',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#3B82F6',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'SALOME',
    'mobile-web-app-capable': 'yes',
    'application-name': 'SALOME',
    'msapplication-tooltip': 'Platform patungan akun SaaS bersama',
    'msapplication-starturl': '/',
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
    "description": "Solusi Patungan Satu Software Rame - Rame. Tanpa Ribet pembayaran Tanpa susah cari teman patungan. Amanah, mudah, dan terpercaya.",
    "url": "https://salome.cloudfren.id",
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
        <Favicon />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize performance optimizations
              if (typeof window !== 'undefined') {
                ${initializePerformanceOptimizations.toString()}();
                ${initializeAnalytics.toString()}();
                ${trackPerformance.toString()}();
                ${trackSessionDuration.toString()}();
                ${initializeSEOMonitoring.toString()}();
              }
            `
          }}
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
