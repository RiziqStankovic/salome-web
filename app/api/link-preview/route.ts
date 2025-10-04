import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    // For SALOME domain, return specific data
    if (parsedUrl.hostname.includes('salome.cloudfren.id') || parsedUrl.hostname.includes('salome.cloudfren.id')) {
      return NextResponse.json({
        title: 'SALOME - Patungan Akun SaaS Bersama',
         description: 'Solusi Patungan Satu Software Rame - Rame. Tanpa Ribet pembayaran Tanpa susah cari teman patungan. Amanah, mudah, dan terpercaya.',
        image: 'https://salome.cloudfren.id/og-image.jpg',
        favicon: 'https://salome.cloudfren.id/favicon.ico',
        domain: 'salome.cloudfren.id',
        publishedTime: new Date().toISOString(),
        author: 'SALOME Team'
      })
    }

    // For other URLs, you would typically fetch the page and extract metadata
    // For now, return a generic response
    return NextResponse.json({
      title: parsedUrl.hostname,
      description: `Link ke ${parsedUrl.hostname}`,
      image: null,
      favicon: `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}`,
      domain: parsedUrl.hostname,
      publishedTime: new Date().toISOString(),
      author: null
    })

  } catch (error) {
    console.error('Error in link preview API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
