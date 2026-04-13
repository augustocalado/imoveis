import { Metadata, ResolvingMetadata } from 'next';
import { supabaseServer } from '@/lib/supabase-server';
import PropertyDetailsClient from '@/components/PropertyDetailsClient';
import { notFound, redirect } from 'next/navigation';

interface Props {
    params: Promise<{ slug: string }>;
}

async function getProperty(slug: string) {
    const { data: prop } = await supabaseServer
        .from('properties')
        .select('*, corretor:profiles!corretor_id(*)')
        .eq('slug', slug)
        .single();
    
    return prop;
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const slug = (await params).slug;
    const property = await getProperty(slug);

    if (!property) {
        return {
            title: 'Imóvel não encontrado | Kátia e Flávio Imóveis',
        };
    }

    const previousImages = (await parent).openGraph?.images || [];
    const mainImage = property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200';

    return {
        title: `${property.title} | ${property.neighborhood}`,
        description: property.description?.substring(0, 160) || 'Confira os detalhes deste imóvel incrível em Praia Grande.',
        openGraph: {
            title: property.title,
            description: `Valor: ${property.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} | ${property.neighborhood}, ${property.city}`,
            url: `https://katiaeflavioimoveis.com.br/imovel/${slug}`,
            siteName: 'Kátia e Flávio Imóveis',
            images: [
                {
                    url: mainImage,
                    width: 1200,
                    height: 630,
                    alt: property.title,
                }
            ],
            locale: 'pt_BR',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: property.title,
            description: property.description?.substring(0, 160),
            images: [mainImage],
        },
    };
}

export default async function Page({ params }: Props) {
    const slug = (await params).slug;
    let property = await getProperty(slug);

    if (!property) {
        const { data: fallbackProp } = await supabaseServer
            .from('properties')
            .select('slug')
            .or(`reference_id.eq.${slug},id.eq.${slug}`)
            .maybeSingle();

        if (fallbackProp?.slug) {
            redirect(`/imovel/${fallbackProp.slug}`);
        }
        
        notFound();
    }

    return (
        <PropertyDetailsClient initialProperty={property} slug={slug} />
    );
}
