import { MetadataRoute } from 'next'
import { supabaseServer } from '@/lib/supabase-server'

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
    ]);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.katiaeflavioimoveis.com.br'

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

    const propertyRoutes: MetadataRoute.Sitemap = [];
    const blogRoutes: MetadataRoute.Sitemap = [];

    try {
        const { data: properties } = await withTimeout(
            supabaseServer
                .from('properties')
                .select('slug, updated_at')
                .in('status', ['disponivel', 'disponível', 'Disponivel', 'Disponível']),
            10000
        );

        for (const p of (properties || [])) {
            if (p.slug) {
                propertyRoutes.push({
                    url: `${baseUrl}/${p.slug}`,
                    lastModified: new Date(p.updated_at || new Date()),
                    changeFrequency: 'weekly' as const,
                    priority: 0.8,
                });
            }
        }
    } catch {
        // timeout or error — property routes omitted
    }

    try {
        const { data: posts } = await withTimeout(
            supabaseServer
                .from('blog_posts')
                .select('slug, updated_at'),
            10000
        );

        for (const post of (posts || [])) {
            if (post.slug) {
                blogRoutes.push({
                    url: `${baseUrl}/blog/${post.slug}`,
                    lastModified: new Date(post.updated_at || new Date()),
                    changeFrequency: 'weekly' as const,
                    priority: 0.6,
                });
            }
        }
    } catch {
        // timeout or error — blog routes omitted
    }

    return [...staticRoutes, ...propertyRoutes, ...blogRoutes]
}
