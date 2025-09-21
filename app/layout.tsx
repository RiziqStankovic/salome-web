import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { ConfettiProvider } from '@/contexts/ConfettiContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'SALOME - Patungan Akun SaaS Bersama',
  description: 'Platform untuk patungan dan sharing akun aplikasi SaaS bersama teman-teman. Hemat hingga 90% dengan sistem pembagian biaya yang adil dan aman.',
  keywords: 'patungan, saas, sharing, subscription, group, midtrans, indonesia',
  authors: [{ name: 'SALOME Team' }],
  openGraph: {
    title: 'SALOME - Patungan Akun SaaS Bersama',
    description: 'Platform untuk patungan dan sharing akun aplikasi SaaS bersama teman-teman',
    type: 'website',
    locale: 'id_ID',
    url: 'https://salome.id',
    siteName: 'SALOME',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SALOME - Patungan Akun SaaS Bersama',
    description: 'Platform untuk patungan dan sharing akun aplikasi SaaS bersama teman-teman',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <ConfettiProvider>
              {children}
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
