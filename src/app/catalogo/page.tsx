import CatalogClient from '@/components/CatalogClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Catálogo de Imóveis | Kátia e Flávio Imóveis',
    description: 'Explore nosso portfólio completo de apartamentos, casas e lançamentos na Praia Grande. O imóvel dos seus sonhos está aqui.',
};

export default function CatalogPage() {
    return <CatalogClient />;
}
