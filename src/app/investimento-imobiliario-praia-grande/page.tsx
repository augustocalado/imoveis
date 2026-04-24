
import * as React from 'react';
import { Metadata } from 'next';
import { TrendingUp, Coins, BarChart3, ArrowUpRight, CheckCircle2, Building, Ship, Umbrella } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Investimento Imobiliário em Praia Grande | Rentabilidade e Mercado',
    description: 'Descubra por que Praia Grande é o melhor lugar para investir em imóveis no litoral. Guia completo sobre rentabilidade, Airbnb e valorização imobiliária.',
    openGraph: {
        title: 'Investimento Imobiliário em Praia Grande | Kátia e Flávio Imóveis',
        description: 'Guia definitivo para investidores: rentabilidade em aluguel de temporada e valorização de lançamentos.',
    },
};

export default function InvestimentoPilar() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            
            {/* Hero Section */}
            <section className="relative pt-40 pb-20 bg-primary-900 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <img 
                        src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1920" 
                        className="w-full h-full object-cover" 
                        alt="Investimento Imobiliário"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-transparent" />
                </div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-accent/20 border border-white/10 text-white px-6 py-2 rounded-full font-bold text-[12px] uppercase tracking-widest mb-8">
                        <TrendingUp className="h-4 w-4 text-accent" /> Inteligência Imobiliária
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase mb-8">
                        Investimento <br /><span className="text-accent underline">Imobiliário</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-white/70 max-w-3xl font-medium leading-relaxed mb-12">
                        Seu capital merece a segurança de tijolos e a rentabilidade do litoral que mais cresce em São Paulo.
                    </p>
                    
                    <div className="flex flex-col md:flex-row gap-6">
                        <Link href="/imoveis?type=venda" className="bg-white text-primary-900 px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-2xl hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-3">
                            Ver Oportunidades <ArrowUpRight className="h-5 w-5" />
                        </Link>
                        <a href="https://wa.me/5513997826694" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-white hover:text-primary-900 transition-all flex items-center justify-center gap-3">
                            Consultoria Exclusiva
                        </a>
                    </div>
                </div>
            </section>

            {/* Stats Grid */}
            <section className="py-24 bg-slate-50 border-b border-slate-100 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    {[
                        { label: 'Valorização Média', value: '18% aa', desc: 'Nos últimos 24 meses.' },
                        { label: 'Taxa de Ocupação', value: '75%', desc: 'Média em feriados e verão.' },
                        { label: 'Novos Lançamentos', value: '300+', desc: 'Empreendimentos em 2024.' },
                        { label: 'Turistas/Ano', value: '2M+', desc: 'Visitantes na alta temporada.' }
                    ].map((stat, i) => (
                        <div key={i} className="text-center md:text-left space-y-2">
                            <div className="text-accent font-black text-4xl tracking-tighter">{stat.value}</div>
                            <div className="text-primary-900 font-black text-sm uppercase tracking-widest">{stat.label}</div>
                            <div className="text-slate-400 text-xs font-bold uppercase">{stat.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Main Content */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-12">
                            <div className="space-y-4 text-center md:text-left">
                                <p className="text-accent font-bold text-[12px] uppercase tracking-[0.5em]">Patrimônio com Rentabilidade</p>
                                <h2 className="text-4xl md:text-6xl font-black text-primary-900 tracking-tighter uppercase leading-none">Onde investir em <br />Praia Grande?</h2>
                            </div>
                            
                            <div className="space-y-10">
                                {[
                                    {
                                        icon: <Building className="h-8 w-8 text-accent" />,
                                        title: 'Lançamentos na Planta',
                                        text: 'A maior margem de lucro está na compra antecipada. Empreendimentos no Canto do Forte chegam a valorizar 40% até a entrega.'
                                    },
                                    {
                                        icon: <Umbrella className="h-8 w-8 text-accent" />,
                                        title: 'Locação Por Temporada (Airbnb)',
                                        text: 'Apartamentos compactos frentes ao mar na Guilhermina e Aviação geram renda passiva superior à poupança e fundos imobiliários.'
                                    },
                                    {
                                        icon: <Ship className="h-8 w-8 text-accent" />,
                                        title: 'Imóveis de Alto Padrão',
                                        text: 'O segmento de luxo no litoral paulista é resiliente e mantém a liquidez independente das oscilações do mercado tradicional.'
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-8 group">
                                        <div className="h-20 w-20 rounded-[32px] bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-primary-900 group-hover:text-white transition-all shadow-sm">
                                            {item.icon}
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-xl font-black text-primary-900 uppercase tracking-tighter">{item.title}</h4>
                                            <p className="text-slate-500 font-medium leading-relaxed">{item.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="relative">
                            <div className="aspect-square rounded-[80px] overflow-hidden shadow-3xl">
                                <img 
                                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200" 
                                    className="w-full h-full object-cover" 
                                    alt="Resultados de Investimento"
                                />
                            </div>
                            <div className="absolute -bottom-10 -left-10 bg-accent p-12 rounded-[50px] shadow-2xl text-white">
                                <BarChart3 className="h-10 w-10 mb-6" />
                                <div className="text-4xl font-black tracking-tighter mb-1">ROE + Yield</div>
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Foco em Performance</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison */}
            <section className="py-32 bg-primary-900 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Comparativo de Investimento</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white/5 border border-white/10 p-12 rounded-[40px] space-y-8">
                            <h3 className="text-xl font-black text-accent uppercase tracking-widest">Renda Fixa Tradicional</h3>
                            <ul className="space-y-4">
                                <li className="flex gap-3 text-white/60 font-medium italic"><Coins className="h-5 w-5 text-red-400 shrink-0" /> Rendimento limitado à taxa básica de juros.</li>
                                <li className="flex gap-3 text-white/60 font-medium italic"><Coins className="h-5 w-5 text-red-400 shrink-0" /> Sem proteção contra inflação real de preços.</li>
                                <li className="flex gap-3 text-white/60 font-medium italic"><Coins className="h-5 w-5 text-red-400 shrink-0" /> Sem usufruto (você não pode "morar" no seu CDB).</li>
                            </ul>
                        </div>
                        <div className="bg-white p-12 rounded-[40px] shadow-xl space-y-8">
                            <h3 className="text-xl font-black text-primary-900 uppercase tracking-widest">Imóveis em Praia Grande</h3>
                            <ul className="space-y-4">
                                <li className="flex gap-3 text-slate-600 font-bold"><CheckCircle2 className="h-5 w-5 text-[#10b981] shrink-0" /> Valorização do Ativo + Aluguel Mensal.</li>
                                <li className="flex gap-3 text-slate-600 font-bold"><CheckCircle2 className="h-5 w-5 text-[#10b981] shrink-0" /> Proteção Total: Ativo Físico e Tangível.</li>
                                <li className="flex gap-3 text-slate-600 font-bold"><CheckCircle2 className="h-5 w-5 text-[#10b981] shrink-0" /> Usufruto e Lazer para sua família.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="py-32 text-center px-6">
                <div className="max-w-4xl mx-auto space-y-12">
                    <h2 className="text-4xl md:text-7xl font-black text-primary-900 tracking-tighter uppercase leading-none">Receba Oportunidades <br /> <span className="text-accent underline">Exclusivas</span></h2>
                    <p className="text-slate-400 font-bold text-lg uppercase tracking-widest leading-relaxed">Assine nossa lista de investidores e receba ofertas "off-market" antes de todo o mercado.</p>
                    <div className="flex flex-col md:flex-row justify-center gap-6 pt-10">
                        <a href="https://wa.me/5513997826694" className="bg-primary-900 text-white px-12 py-6 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-110 transition-all flex items-center justify-center gap-4">
                            Entrar na Lista VIP
                        </a>
                        <Link href="/catalogo" className="bg-accent text-white px-12 py-6 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-110 transition-all">
                            Ver Lançamentos
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
