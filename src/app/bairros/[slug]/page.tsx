
import * as React from 'react';
import { Metadata } from 'next';
import { MapPin, CheckCircle2, Star, ArrowRight, Building2, TrendingUp, Waves, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CatalogClient from '@/components/CatalogClient';
import { notFound } from 'next/navigation';

// Mock de dados de conteúdo SEO para bairros
const NEIGHBORHOOD_CONTENT: Record<string, any> = {
    'guilhermina': {
        name: 'Guilhermina',
        title: 'Imóveis à Venda na Guilhermina | O Coração de Praia Grande',
        description: 'Encontre os melhores apartamentos e casas na Vila Guilhermina. Um bairro completo com lazer, praia e alta valorização imobiliária.',
        heroImg: 'https://images.unsplash.com/photo-1519046464350-3e28aa4ff0f1?q=80&w=1200',
        subtopics: [
            { icon: <Star className="h-6 w-6 text-accent" />, title: 'Morar na Guilhermina vale a pena?', text: 'Com uma das orlas mais bonitas da cidade e uma rede de comércio vibrante, a Guilhermina oferece o equilíbrio perfeito entre agito e tranquilidade.' },
            { icon: <Waves className="h-6 w-6 text-accent" />, title: 'Imóveis perto da praia', text: 'A Vila Guilhermina é famosa por seus prédios modernos a poucos metros do mar, com ciclovias e quiosques revitalizados.' },
            { icon: <TrendingUp className="h-6 w-6 text-accent" />, title: 'Valorização Imobiliária', text: 'Investir na Guilhermina é garantia de retorno. O bairro recebe constantes melhorias públicas e novos empreendimentos de alto nível.' }
        ]
    },
    'canto-do-forte': {
        name: 'Canto do Forte',
        title: 'Imóveis no Canto do Forte | O Bairro Mais Nobre de Praia Grande',
        description: 'Viva no Canto do Forte. Luxo, segurança e exclusividade no bairro mais valorizado do litoral paulista.',
        heroImg: 'https://images.unsplash.com/photo-1444676632488-26a136c45b9b?q=80&w=1200',
        subtopics: [
            { icon: <Star className="h-6 w-6 text-accent" />, title: 'Bairro Mais Valorizado', text: 'O metro quadrado mais caro de Praia Grande reflete a exclusividade e a demanda constante por esta localização privilegiada.' },
            { icon: <Building2 className="h-6 w-6 text-accent" />, title: 'Imóveis de Alto Padrão', text: 'Mansões e coberturas cinematográficas definem o skyline do Canto do Forte, atraindo um público exigente e seletivo.' },
            { icon: <CheckCircle2 className="h-6 w-6 text-accent" />, title: 'Qualidade de Vida e Gastronomia', text: 'Próximo à Fortaleza de Itaipu, o bairro conta com os melhores restaurantes e uma vida noturna sofisticada e segura.' }
        ]
    },
    'caicara': {
        name: 'Vila Caiçara',
        title: 'Casas e Apartamentos na Vila Caiçara | Tranquilidade e Lazer',
        description: 'Descubra a Vila Caiçara. O lugar perfeito para quem busca aposentadoria com qualidade ou lazer em família perto do mar.',
        heroImg: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=1200',
        subtopics: [
            { icon: <TrendingUp className="h-6 w-6 text-accent" />, title: 'Imóveis para Aposentadoria', text: 'O clima familiar e a tranquilidade da Vila Caiçara tornam o bairro a escolha número um para quem deseja desfrutar a melhor idade no litoral.' },
            { icon: <Waves className="h-6 w-6 text-accent" />, title: 'Imóveis Perto do Mar', text: 'Destaque para sua feirinha de artesanato e orla arborizada, ideal para caminhadas matinais e contato direto com a natureza.' },
            { icon: <CheckCircle2 className="h-6 w-6 text-accent" />, title: 'Crescimento Sustentável', text: 'O Caiçara vive um novo boom imobiliário, com prédios que oferecem lazer completo sem perder a essência de bairro residencial.' }
        ]
    },
    'boqueirao': {
        name: 'Boqueirão',
        title: 'Imóveis no Boqueirão | O Centro Comercial de Praia Grande',
        description: 'Explore o Boqueirão. Onde tudo acontece em Praia Grande: comércio, mobilidade e ótimas opções de investimento.',
        heroImg: 'https://images.unsplash.com/photo-1464933058529-0af70acec40c?q=80&w=1200',
        subtopics: [
            { icon: <ShoppingBag className="h-6 w-6 text-accent" />, title: 'Comércio e Conveniência', text: 'No Boqueirão você faz tudo a pé. Bancos, escolas, hospitais e as principais lojas da cidade estão concentradas aqui.' },
            { icon: <TrendingUp className="h-6 w-6 text-accent" />, title: 'Mobilidade Urbana', text: 'Ponto estratégico de entrada e saída da cidade, com fácil acesso ao transporte público e principais vias expressas.' },
            { icon: <Star className="h-6 w-6 text-accent" />, title: 'Investimento Seguro', text: 'A alta rotatividade e demanda por aluguel fixo tornam o Boqueirão o "porto seguro" para investidores conservadores.' }
        ]
    }
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const content = NEIGHBORHOOD_CONTENT[slug];
    
    if (!content) return { title: 'Bairro não encontrado' };

    return {
        title: content.title,
        description: content.description,
        openGraph: {
            title: content.title,
            description: content.description,
            images: [content.heroImg]
        }
    };
}

export default async function NeighborhoodPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const content = NEIGHBORHOOD_CONTENT[slug];

    if (!content) notFound();

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            
            {/* Hero Section */}
            <section className="relative pt-40 pb-20 bg-primary-900 overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <img src={content.heroImg} className="w-full h-full object-cover" alt={content.name} />
                    <div className="absolute inset-0 bg-gradient-to-b from-primary-900 via-primary-900/40 to-white" />
                </div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="inline-flex items-center gap-2 text-accent font-black text-[10px] uppercase tracking-[0.4em] mb-6">
                        <MapPin className="h-4 w-4" /> Explorando Bairros
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-white leading-none tracking-tighter uppercase mb-6">
                        Conheça o <br /><span className="text-accent underline">{content.name}</span>
                    </h1>
                    <p className="text-xl text-white/70 max-w-2xl font-medium leading-relaxed mb-12">
                        {content.description}
                    </p>
                </div>
            </section>

            {/* Subtopics Clusters */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {content.subtopics.map((topic: any, i: number) => (
                            <div key={i} className="bg-slate-50 p-12 rounded-[50px] border border-slate-100 hover:shadow-2xl transition-all group">
                                <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-10 group-hover:bg-accent group-hover:text-white transition-all">
                                    {topic.icon}
                                </div>
                                <h3 className="text-xl font-black text-primary-900 uppercase tracking-tighter mb-4">{topic.title}</h3>
                                <p className="text-slate-500 font-medium leading-[1.8]">{topic.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Property Showcase specifically for this neighborhood */}
            <section className="py-32 bg-slate-50/50 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                        <div>
                            <p className="text-accent font-black text-[10px] uppercase tracking-[0.4em] mb-4">Catálogo Local</p>
                            <h2 className="text-4xl md:text-6xl font-black text-primary-900 tracking-tighter uppercase leading-none">
                                Imóveis no <br /><span className="text-accent italic">{content.name}</span>
                            </h2>
                        </div>
                        <Link href={`/imoveis?neighborhood=${content.name}`} className="bg-primary-900 text-white px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:scale-105 transition-all">
                            Ver Todos no Bairro
                        </Link>
                    </div>
                    
                    {/* Catalog client pre-filtered by neighborhood */}
                    <div>
                         <CatalogClient />
                    </div>
                </div>
            </section>

            {/* FAQ/Contact CTA for the Neighborhood */}
            <section className="py-32 text-center px-6">
                <div className="max-w-4xl mx-auto bg-primary-900 rounded-[80px] p-12 md:p-32 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/shattered.png')]" />
                    <div className="relative z-10 space-y-12">
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-tight">
                            Quer saber mais sobre <br /> o bairro <span className="text-accent">{content.name}?</span>
                        </h2>
                        <p className="text-white/40 font-bold text-lg uppercase tracking-[0.2em]">Fale com um corretor especialista da região.</p>
                        <div className="flex justify-center flex-wrap gap-4">
                            <a href="https://wa.me/5513997826694" className="bg-[#25d366] text-white px-12 py-6 rounded-[24px] font-black text-xs uppercase tracking-widest hover:scale-110 transition-all flex items-center gap-3">
                                WhatsApp do Bairro <ArrowRight className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
