import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const revalidate = 3600; // Cache 1 hora

/**
 * Feed de Dados para Remarketing Dinâmico do Google Ads (Rede de Display)
 * Vertical: Imóveis e Aluguéis (Real Estate)
 * 
 * Formatos suportados:
 * - CSV (Padrão para Google Ads -> Ferramentas -> Dados da empresa -> Feeds de dados)
 * - XML (formato alternativo RSS/Google Merchant)
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format') || 'csv';

        // Busca todos os imóveis disponíveis
        const { data: properties, error } = await supabaseServer
            .from('properties')
            .select('*')
            .in('status', ['disponivel', 'disponível', 'Disponivel', 'Disponível'])
            .order('created_at', { ascending: false });

        if (error) throw error;

        const siteUrl = 'https://www.katiaeflavioimoveis.com.br';

        if (format === 'csv') {
            // Cabeçalho oficial do Google Ads para Feeds de Imóveis (Real Estate)
            const headers = [
                'Listing ID',
                'Listing title',
                'Final URL',
                'Image URL',
                'City name',
                'Description',
                'Price',
                'Property type',
                'Listing type',
                'Contextual keywords',
                'Address'
            ];

            const escapeCsv = (str: string | number | null | undefined) => {
                if (str === null || str === undefined) return '""';
                const s = String(str).replace(/"/g, '""').replace(/[\r\n]+/g, ' ');
                return `"${s}"`;
            };

            const rows = (properties || []).map((prop) => {
                const listingId = prop.reference_id || prop.id;
                const title = prop.title || 'Imóvel em Praia Grande';
                const finalUrl = `${siteUrl}/${prop.slug || prop.id}`;
                const imageUrl = prop.images?.[0] || '';
                const city = prop.city || 'Praia Grande';
                const description = prop.description?.slice(0, 150) || title;
                const priceFormatted = prop.price ? `${prop.price} BRL` : '0 BRL';
                const propertyType = prop.category || prop.subtype || 'Apartamento';
                const listingType = prop.type === 'locacao' || prop.type === 'aluguel' ? 'Rent' : 'Sale';
                const keywords = [city, prop.neighborhood, propertyType].filter(Boolean).join('; ');
                const address = `${prop.neighborhood || ''}, ${city}, SP`;

                return [
                    escapeCsv(listingId),
                    escapeCsv(title),
                    escapeCsv(finalUrl),
                    escapeCsv(imageUrl),
                    escapeCsv(city),
                    escapeCsv(description),
                    escapeCsv(priceFormatted),
                    escapeCsv(propertyType),
                    escapeCsv(listingType),
                    escapeCsv(keywords),
                    escapeCsv(address)
                ].join(',');
            });

            const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

            return new NextResponse(csvContent, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': 'inline; filename="google-ads-real-estate-feed.csv"',
                    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
                },
            });
        }

        // Formato XML alternativo
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
    <channel>
        <title>Kátia e Flávio Imóveis - Feed Google Ads</title>
        <link>${siteUrl}</link>
        <description>Feed de Imóveis para Remarketing Dinâmico e Rede de Display</description>`;

        (properties || []).forEach((prop) => {
            const listingId = prop.reference_id || prop.id;
            const finalUrl = `${siteUrl}/${prop.slug || prop.id}`;
            const imageUrl = prop.images?.[0] || '';
            const price = prop.price ? `${prop.price} BRL` : '0 BRL';

            xml += `
        <item>
            <g:id>${listingId}</g:id>
            <g:title><![CDATA[${prop.title || 'Imóvel em Praia Grande'}]]></g:title>
            <g:description><![CDATA[${prop.description?.slice(0, 500) || ''}]]></g:description>
            <g:link>${finalUrl}</g:link>
            <g:image_link>${imageUrl}</g:image_link>
            <g:price>${price}</g:price>
            <g:condition>new</g:condition>
            <g:availability>in stock</g:availability>
            <g:product_type><![CDATA[${prop.category || 'Apartamento'}]]></g:product_type>
        </item>`;
        });

        xml += `
    </channel>
</rss>`;

        return new NextResponse(xml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error: any) {
        console.error('[Google Ads Feed Error]:', error);
        return NextResponse.json({ error: error.message || 'Erro ao gerar feed' }, { status: 500 });
    }
}

