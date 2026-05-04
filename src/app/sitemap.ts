import { MetadataRoute } from 'next'
import { supabaseServer } from '@/lib/supabase-server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.katiaeflavioimoveis.com.br'

    try {
        // Static routes
        const staticRoutes: MetadataRoute.Sitemap = [
            { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
            { url: `${baseUrl}/imoveis`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
            { url: `${baseUrl}/lancamentos`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
            { url: `${baseUrl}/bairros`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
            { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
            { url: `${baseUrl}/sobre-nos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
            { url: `${baseUrl}/contato`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
            { url: `${baseUrl}/politica-de-privacidade`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
            { url: `${baseUrl}/comprar-imovel-em-praia-grande`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
            { url: `${baseUrl}/financiamento-imobiliario-praia-grande`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
            { url: `${baseUrl}/investimento-imobiliario-praia-grande`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
            { url: `${baseUrl}/apartamento-frente-mar-praia-grande`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
            { url: `${baseUrl}/imoveis-com-piscina-praia-grande`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
            { url: `${baseUrl}/bairros/guilhermina`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
            { url: `${baseUrl}/bairros/canto-do-forte`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
            { url: `${baseUrl}/bairros/caicara`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
            { url: `${baseUrl}/bairros/boqueirao`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
            { url: `${baseUrl}/alugar`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
            { url: `${baseUrl}/comprar`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
            { url: `${baseUrl}/cadastro`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
            { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
            { url: `${baseUrl}/mapa-do-site`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 }
        ];

        // Fetch properties
        const { data: properties } = await supabaseServer
            .from('properties')
            .select('slug, updated_at')
            .in('status', ['disponivel', 'disponível', 'Disponivel', 'Disponível'])
        
        const propertyRoutes = (properties || []).map((p) => ({
            url: `${baseUrl}/${p.slug}`,
            lastModified: new Date(p.updated_at || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }))

        // Fetch blog posts
        const { data: posts } = await supabaseServer
            .from('blog_posts')
            .select('slug, updated_at')
        
        const blogRoutes = (posts || []).map((post) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: new Date(post.updated_at || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }))

        return [...staticRoutes, ...propertyRoutes, ...blogRoutes]
    } catch (error) {
        console.error("Error generating sitemap:", error);
        return [{ url: baseUrl, lastModified: new Date() }];
    }
}

