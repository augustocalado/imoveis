import * as React from 'react';
import { Metadata } from 'next';
import BairrosClient from '@/components/BairrosClient';

export const metadata: Metadata = {
    title: 'Imóveis por Bairros e Cidades | Kátia e Flávio Imóveis',
    description: 'Explore os melhores imóveis em Praia Grande e região, separados por bairro e cidade. Encontre seu apartamento no Canto do Forte, Boqueirão, Guilhermina e mais.',
    openGraph: {
        title: 'Imóveis por Bairros e Cidades | Praia Grande SP',
        description: 'Navegue pelo nosso catálogo de imóveis selecionados nas melhores localizações da Baixada Santista.',
    },
};

export default function BairrosPage() {
    return <BairrosClient />;
}
