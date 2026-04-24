
import * as React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Search, MapPin, CheckCircle2, ArrowRight, Building2, Wallet, ShieldCheck, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CatalogClient from '@/components/CatalogClient';

export const metadata: Metadata = {
    title: 'Comprar Imóvel em Praia Grande | Guia Completo e Melhores Opções',
    description: 'Procurando imóvel em Praia Grande? Confira nosso guia exclusivo sobre como comprar com segurança, os melhores bairros e as melhores ofertas do mercado.',
    openGraph: {
        title: 'Comprar Imóvel em Praia Grande | Kátia e Flávio Imóveis',
        description: 'Encontre o seu novo lar no litoral paulista. Guia completo de documentação, bairros e financiamento.',
    },
};

export default function ComprarImovelPilar() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            
            {/* Hero Section */}
            <section className="relative pt-40 pb-20 bg-[#1B263B] overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <img 
                        src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1920" 
                        className="w-full h-full object-cover" 
                        alt="Imóveis em Praia Grande"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-primary-900 to-transparent" />
                </div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-accent/20 border border-white/10 text-white px-6 py-2 rounded-full font-bold text-[12px] uppercase tracking-widest mb-8">
                        <Star className="h-4 w-4 text-accent" /> Sua Conquista Começa Aqui
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase mb-8">
                        Comprar Imóvel em <br /><span className="text-accent underline">Praia Grande</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-white/70 max-w-3xl font-medium leading-relaxed mb-12">
                        Tudo o que você precisa saber para realizar o sonho da casa própria ou fazer um investimento seguro no litoral paulista.
                    </p>
                    
                    <div className="flex flex-col md:flex-row gap-6">
                        <Link href="/imoveis?type=venda" className="bg-accent text-white px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3">
                            Ver Imóveis à Venda <ArrowRight className="h-5 w-5" />
                        </Link>
                        <a href="https://wa.me/5513997826694" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-white hover:text-primary-900 transition-all flex items-center justify-center gap-3">
                            Consultoria Direta
                        </a>
                    </div>
                </div>
            </section>

            {/* Content Section 1: Por que PG? */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="relative">
                        <div className="aspect-square rounded-[60px] overflow-hidden shadow-3xl">
                            <img 
                                src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200" 
                                className="w-full h-full object-cover" 
                                alt="Praia Grande SP"
                            />
                        </div>
                        <div className="absolute -bottom-10 -right-10 bg-white p-12 rounded-[40px] shadow-2xl border border-slate-50 hidden md:block">
                            <div className="text-5xl font-black text-primary-900 mb-2">15+</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Anos de Experiência</div>
                        </div>
                    </div>
                    
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <p className="text-accent font-bold text-[12px] uppercase tracking-[0.5em]">Mercado Imobiliário</p>
                            <h2 className="text-4xl md:text-6xl font-black text-primary-900 tracking-tighter uppercase leading-none">
                                Por que comprar em <br />Praia Grande?
                            </h2>
                        </div>
                        
                        <div className="text-lg text-slate-500 leading-relaxed font-medium space-y-6">
                            <p>
                                Praia Grande é hoje a cidade que mais cresce na Baixada Santista. Com uma infraestrutura moderna, orla totalmente revitalizada e uma oferta diversificada de serviços, a cidade se tornou o destino preferido tanto para moradia quanto para veraneio.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                                {[
                                    'Valorização Constante',
                                    'Infraestrutura Completa',
                                    'Qualidade de Vida',
                                    'Segurança Jurídica',
                                    'Lazer o Ano Todo',
                                    'Ótimo Custo-Benefício'
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-[#10b981]" />
                                        <span className="font-bold text-primary-900 text-sm uppercase tracking-tight">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Documentation Hub */}
            <section className="py-32 bg-slate-50 border-y border-slate-100 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black text-primary-900 tracking-tighter uppercase leading-none">Documentação Necessária</h2>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">O que você precisa para uma compra segura</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <ShieldCheck className="h-8 w-8 text-accent" />,
                                title: 'Documentos Pessoais',
                                desc: 'RG, CPF, Comprovante de Residência e Estado Civil (Certidão de Nascimento ou Casamento).'
                            },
                            {
                                icon: <Building2 className="h-8 w-8 text-accent" />,
                                title: 'Certidões do Imóvel',
                                desc: 'Matrícula Atualizada, Certidão Negativa de Ônus e Certidão Negativa de Débitos Municipais (IPTU).'
                            },
                            {
                                icon: <Wallet className="h-8 w-8 text-accent" />,
                                title: 'Análise Financeira',
                                desc: 'Comprovantes de renda (Holerites ou IR) para casos de financiamento bancário imediato.'
                            }
                        ].map((doc, i) => (
                            <div key={i} className="bg-white p-12 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                                <div className="mb-8">{doc.icon}</div>
                                <h3 className="text-xl font-black text-primary-900 uppercase tracking-tighter mb-4">{doc.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">{doc.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Satellite Content Links (Related) */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto bg-primary-900 rounded-[60px] p-12 md:p-24 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-white opacity-[0.03] skew-x-[-20deg] translate-x-20" />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
                        <div className="space-y-8">
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight">
                                Continue sua jornada <br /><span className="text-accent underline">informativa</span>
                            </h2>
                            <p className="text-white/60 text-lg font-medium">Aprofunde seus conhecimentos com nossos guias especializados sobre os bairros e opções financeiras.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { title: 'Dicas sobre Financiamento', href: '/financiamento-imobiliario-praia-grande' },
                                { title: 'Melhores Bairros para Morar', href: '/bairros' },
                                { title: 'Como Investir em Airbnb', href: '/investimento-imobiliario-praia-grande' }
                            ].map((link, i) => (
                                <Link 
                                    key={i} 
                                    href={link.href}
                                    className="group bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between hover:bg-white hover:text-primary-900 transition-all"
                                >
                                    <span className="font-black uppercase tracking-widest text-xs">{link.title}</span>
                                    <ArrowRight className="h-5 w-5 text-accent opacity-0 group-hover:opacity-100 transition-all" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Catalog Preview (Call Option) */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 text-accent font-black text-[12px] uppercase tracking-[0.4em] mb-8">
                        Portfólio em Destaque
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-primary-900 tracking-tighter uppercase leading-none mb-20">Imóveis Novos à <span className="text-accent">Venda</span></h2>
                    
                    {/* Aqui renderizamos o componente de catálogo filtrado */}
                    <div className="mt-12">
                        <CatalogClient />
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
