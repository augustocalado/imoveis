import * as React from 'react';
import { Metadata } from 'next';
import SobreNosClient from '@/components/SobreNosClient';

export const metadata: Metadata = {
    title: 'Sobre Nós | Kátia e Flávio Imóveis',
    description: 'Conheça a história e os valores da Kátia e Flávio Imóveis. Especialistas no mercado imobiliário de Praia Grande com mais de 15 anos de experiência.',
    openGraph: {
        title: 'Sobre Nós - Kátia e Flávio Imóveis',
        description: 'Excelência, transparência e segurança jurídica na compra e venda do seu imóvel em Praia Grande.',
    },
};

export default function SobreNosPage() {
    return <SobreNosClient />;
}
