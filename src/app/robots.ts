import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/corretor/', '/cliente/'],
        },
        sitemap: 'https://www.katiaeflavioimoveis.com.br/sitemap.xml',
    }
}
