import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://simplicityblog.com'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/create-post/', '/edit-post/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}