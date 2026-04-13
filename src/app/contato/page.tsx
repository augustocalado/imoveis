import * as React from 'react';
import { Metadata } from 'next';
import ContatoClient from '@/components/ContatoClient';

export const metadata: Metadata = {
    title: 'Contato | Kátia e Flávio Imóveis',
    description: 'Entre em contato com a Kátia e Flávio Imóveis. Estamos prontos para te atender e ajudar a encontrar o seu novo lar em Praia Grande.',
    openGraph: {
        title: 'Fale Conosco - Kátia e Flávio Imóveis',
        description: 'Canais de atendimento exclusivos para você tirar suas dúvidas e agendar visitas aos melhores imóveis da região.',
    },
};

export default function ContatoPage() {
    return <ContatoClient />;
}
