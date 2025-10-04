import Head from 'next/head'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: string
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
}

export default function SEOHead({
  title = 'SALOME - Patungan Akun SaaS Bersama',
  description = 'Solusi Patungan Satu Software Rame - Rame Tanpa Ribet pembayaran Tanpa susah cari teman patungan Amanah, mudah, dan terpercaya.',
  keywords = [
    'patungan saas',
    'sharing subscription',
    'patungan aplikasi',
    'group subscription',
    'midtrans payment',
    'indonesia',
    'hemat biaya',
    'subscription sharing'
  ],
  image = '/og-image.jpg',
  url = 'https://salome.cloudfren.id',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'SALOME Team',
  section,
  tags = []
}: SEOHeadProps) {
  const fullTitle = title.includes('SALOME') ? title : `${title} | SALOME`
  const fullUrl = url.startsWith('http') ? url : `https://salome.cloudfren.id${url}`
  const fullImage = image.startsWith('http') ? image : `https://salome.cloudfren.id${image}`

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Indonesian" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="SALOME" />
      <meta property="og:locale" content="id_ID" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:creator" content="@salome_id" />
      <meta name="twitter:site" content="@salome_id" />

      {/* Article Meta Tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Additional SEO Meta Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      <meta name="msapplication-TileImage" content="/mstile-144x144.png" />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://salome.cloudfren.id" />

      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//salome.cloudfren.id" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": type === 'article' ? 'Article' : 'WebPage',
            "headline": fullTitle,
            "description": description,
            "url": fullUrl,
            "image": fullImage,
            "author": {
              "@type": "Organization",
              "name": author
            },
            "publisher": {
              "@type": "Organization",
              "name": "SALOME",
              "logo": {
                "@type": "ImageObject",
                "url": "https://salome.cloudfren.id/logo.png"
              }
            },
            "datePublished": publishedTime,
            "dateModified": modifiedTime || publishedTime,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": fullUrl
            }
          })
        }}
      />
    </Head>
  )
}
