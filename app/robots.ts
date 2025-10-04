import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/_next/',
        '/static/',
        '/verify-email',
        '/private/',
      ],
    },
    sitemap: 'https://salome.cloudfren.id/sitemap.xml',
  }
}
