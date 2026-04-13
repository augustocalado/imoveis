import * as React from 'react';
import { Metadata } from 'next';
import CatalogClient from '@/components/CatalogClient';

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
    { searchParams }: Props
): Promise<Metadata> {
    const resolvedSearchParams = await searchParams;
    const city = resolvedSearchParams.city as string;
    const neighborhood = resolvedSearchParams.neighborhood as string;
    const type = resolvedSearchParams.type as string;

    let titleParts = [];
    if (type === 'venda') titleParts.push('Venda de Imóveis');
    else if (type === 'aluguel') titleParts.push('Aluguel de Imóveis');
    else titleParts.push('Imóveis');

    if (neighborhood) titleParts.push(`em ${neighborhood.split(',')[0]}`);
    if (city) titleParts.push(`em ${city}`);

    const title = `${titleParts.join(' ')} | Kátia e Flávio Imóveis`;
    const description = `Confira as melhores opções de ${titleParts.join(' ')}. Apartamentos, casas e lançamentos com os melhores preços da região.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
        },
    };
}

export default async function SearchPage({ searchParams }: Props) {
    // searchParams is awaited for Next.js 15 compatibility
    await searchParams;
    return <CatalogClient />;
}
