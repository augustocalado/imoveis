'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Network, Home, Building2, MapPin, Info, Mail, UserPlus, Key, ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function MapaDoSitePage() {
    const sections = [
        {
            title: 'Busca de Imóveis',
            icon: <Building2 className="h-6 w-6" />,
            links: [
                { name: 'Todos os Imóveis', href: '/imoveis', description: 'Explore nossa listagem completa de propriedades.' },
                { name: 'Imóveis para Comprar', href: '/comprar', description: 'Encontre sua casa ou apartamento ideal para venda.' },
                { name: 'Imóveis para Alugar', href: '/alugar', description: 'Veja as melhores opções de locação em Praia Grande.' },
                { name: 'Lançamentos', href: '/lancamentos', description: 'Novos empreendimentos e oportunidades na planta.' },
                { name: 'Bairros e Cidades', href: '/bairros', description: 'Navegue pelos melhores bairros da região.' },
            ]
        },
        {
            title: 'Institucional',
            icon: <Info className="h-6 w-6" />,
            links: [
                { name: 'Sobre Nós', href: '/sobre-nos', description: 'Conheça a história de Kátia e Flávio Imóveis.' },
                { name: 'Fale Conosco', href: '/contato', description: 'Entre em contato com nossa equipe de corretores.' },
                { name: 'Área do Cliente', href: '/login', description: 'Acesse seu painel exclusivo.' },
                { name: 'Cadastre seu Imóvel', href: '/cadastro', description: 'Venda ou alugue sua propriedade conosco.' },
            ]
        },
        {
            title: 'Ações Rápidas',
            icon: <Key className="h-6 w-6" />,
            links: [
                { name: 'Login Administrativo', href: '/login', description: 'Acesso para corretores e administradores.' },
                { name: 'Página Inicial', href: '/', description: 'Volte para nossa página principal.' },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.3em] text-accent mb-6">
                        <Network className="h-4 w-4" />
                        <span>Organização</span>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-black text-primary-900 tracking-tighter mb-16 max-w-5xl leading-[0.85] uppercase">
                        Mapa do <span className="text-primary-600">Site</span>
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                        {sections.map((section, idx) => (
                            <div key={idx} className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                                <div className="bg-primary-50 w-16 h-16 rounded-3xl flex items-center justify-center text-primary-600 mb-8 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-500">
                                    {section.icon}
                                </div>
                                <h2 className="text-2xl font-black text-primary-900 uppercase tracking-tighter mb-8">{section.title}</h2>
                                <div className="space-y-6">
                                    {section.links.map((link, lIdx) => (
                                        <Link key={lIdx} href={link.href} className="block group/link">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 bg-accent/10 p-1 rounded-md text-accent group-hover/link:bg-accent group-hover/link:text-white transition-colors">
                                                    <ChevronRight className="h-3 w-3" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-primary-900 uppercase text-sm tracking-widest group-hover/link:text-accent transition-colors">
                                                        {link.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-400 font-bold uppercase mt-1 leading-relaxed opacity-60">
                                                        {link.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-primary-900 rounded-[80px] p-20 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent transition-opacity group-hover:opacity-60 duration-1000" />
                        <div className="relative z-10 space-y-10">
                            <h2 className="text-5xl font-black text-white tracking-tighter max-w-2xl mx-auto leading-[0.9] uppercase">Não encontrou o que procurava?</h2>
                            <p className="text-white/40 font-bold uppercase tracking-widest text-sm">Nossa equipe está pronta para te ajudar pessoalmente.</p>
                            <Link href="/contato" className="inline-flex bg-accent text-white px-12 py-6 rounded-3xl font-black hover:bg-white hover:text-primary-900 transition-all shadow-xl active:scale-95 group/btn">
                                Falar com um Corretor
                                <ArrowRight className="h-6 w-6 ml-4 group-hover/btn:translate-x-2 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
