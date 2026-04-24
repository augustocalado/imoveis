import { supabaseServer } from '@/lib/supabase-server';
import { permanentRedirect } from 'next/navigation';

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function Page({ params }: Props) {
    const slug = (await params).slug;
    
    // Tenta encontrar o imóvel pelo slug atual
    const { data: property } = await supabaseServer
        .from('properties')
        .select('slug')
        .eq('slug', slug)
        .maybeSingle();

    if (property?.slug) {
        // Redireciona permanentemente para a nova rota na raiz
        permanentRedirect(`/${property.slug}`);
    }

    // Se não encontrou pelo slug, tenta pelo ID ou Reference ID (legado)
    const { data: fallbackProp } = await supabaseServer
        .from('properties')
        .select('slug')
        .or(`reference_id.eq.${slug},id.eq.${slug},reference_id.eq.${slug.toUpperCase()}`)
        .maybeSingle();

    if (fallbackProp?.slug) {
        permanentRedirect(`/${fallbackProp.slug}`);
    }

    // Se nada foi encontrado, redireciona permanentemente para o catálogo/imoveis
    permanentRedirect('/imoveis');
}

