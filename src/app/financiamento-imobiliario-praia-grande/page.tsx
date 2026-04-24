
import * as React from 'react';
import { Metadata } from 'next';
import { Wallet, Calculator, FileText, CheckCircle2, ArrowRight, Landmark, PieChart, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Financiamento Imobiliário em Praia Grande | Guia de Crédito',
    description: 'Tudo sobre financiamento imobiliário em Praia Grande. Saiba como usar seu FGTS, taxas de juros dos principais bancos e documentação necessária.',
    openGraph: {
        title: 'Financiamento Imobiliário em Praia Grande | Kátia e Flávio Imóveis',
        description: 'Seu guia definitivo para aprovação de crédito imobiliário e as melhores taxas do mercado.',
    },
};

export default function FinanciamentoPilar() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            
            {/* Hero Section */}
            <section className="relative pt-40 pb-20 bg-[#10b981] overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <img 
                        src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1920" 
                        className="w-full h-full object-cover" 
                        alt="Financiamento Imobiliário"
                    />
                </div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-white/20 border border-white/10 text-white px-6 py-2 rounded-full font-bold text-[12px] uppercase tracking-widest mb-8">
                        <Wallet className="h-4 w-4 text-white" /> Planejamento Financeiro
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase mb-8">
                        Financiamento <br /><span className="text-primary-900 underline">Imobiliário</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-white/80 max-w-3xl font-medium leading-relaxed mb-12">
                        Descomplicamos o crédito imobiliário para você. Descubra as melhores opções para realizar seu sonho hoje.
                    </p>
                    
                    <div className="flex flex-col md:flex-row gap-6">
                        <a href="https://wa.me/5513997826694" className="bg-primary-900 text-white px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3">
                            Simular Agora <Calculator className="h-5 w-5" />
                        </a>
                        <Link href="/contato" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-white hover:text-primary-900 transition-all flex items-center justify-center gap-3">
                            Falar com Especialista
                        </Link>
                    </div>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="aspect-[4/5] rounded-[60px] overflow-hidden shadow-3xl">
                                <img 
                                    src="https://images.unsplash.com/photo-1454165833202-d196c735aeb1?q=80&w=1200" 
                                    className="w-full h-full object-cover" 
                                    alt="Processo de Financiamento"
                                />
                            </div>
                            <div className="absolute top-10 -left-10 bg-white p-8 rounded-[32px] shadow-2xl border border-slate-50 max-w-[280px]">
                                <h4 className="text-sm font-black text-primary-900 uppercase tracking-tight mb-2">Dica de Especialista</h4>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">"O uso do FGTS pode reduzir em até 30% o valor das suas parcelas. Consulte-nos sobre as regras."</p>
                            </div>
                        </div>

                        <div className="order-1 lg:order-2 space-y-12">
                            <div className="space-y-4">
                                <p className="text-[#10b981] font-bold text-[12px] uppercase tracking-[0.5em]">Passo a Passo</p>
                                <h2 className="text-4xl md:text-6xl font-black text-primary-900 tracking-tighter uppercase leading-none">Como funciona o processo?</h2>
                            </div>

                            <div className="space-y-8">
                                {[
                                    { step: '01', title: 'Análise de Crédito', text: 'Enviamos seus documentos para os principais bancos para aprovação do limite.' },
                                    { step: '02', title: 'Escolha do Imóvel', text: 'Com o crédito aprovado, buscamos as melhores opções dentro do seu orçamento.' },
                                    { step: '03', title: 'Avaliação da Engenharia', text: 'O banco envia um perito para avaliar o valor de garantia do imóvel.' },
                                    { step: '04', title: 'Assinatura do Contrato', text: 'Após a aprovação jurídica, o contrato é assinado e registrado em cartório.' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-6 items-start group">
                                        <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#10b981] font-black text-xl group-hover:bg-[#10b981] group-hover:text-white transition-all shadow-sm">
                                            {item.step}
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-lg font-black text-primary-900 uppercase tracking-tighter">{item.title}</h4>
                                            <p className="text-slate-500 font-medium leading-relaxed">{item.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FGTS and Benefits */}
            <section className="py-32 bg-slate-900 px-6 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#10b981]/10 blur-[100px]" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="space-y-6">
                            <Landmark className="h-12 w-12 text-[#10b981]" />
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Bancos Parceiros</h3>
                            <p className="text-white/40 font-medium leading-relaxed">Trabalhamos com Caixa Econômica, Bradesco, Itaú e Santander para garantir a menor taxa do mercado.</p>
                        </div>
                        <div className="space-y-6">
                            <PieChart className="h-12 w-12 text-[#10b981]" />
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Uso do FGTS</h3>
                            <p className="text-white/40 font-medium leading-relaxed">Você pode utilizar seu saldo do FGTS para a entrada, amortização de parcelas ou liquidação total do contrato.</p>
                        </div>
                        <div className="space-y-6">
                            <ShieldCheck className="h-12 w-12 text-[#10b981]" />
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Segurança Jurídica</h3>
                            <p className="text-white/40 font-medium leading-relaxed">Nossa assessoria jurídica gratuita acompanha todo o processo para garantir uma transação sem riscos.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="py-32 text-center px-6">
                <div className="max-w-4xl mx-auto space-y-12">
                    <Calculator className="h-16 w-16 text-[#10b981] mx-auto" />
                    <h2 className="text-4xl md:text-6xl font-black text-primary-900 tracking-tighter uppercase leading-none">Quer saber seu potencial <br /> de financiamento?</h2>
                    <p className="text-slate-400 font-bold text-lg uppercase tracking-widest leading-relaxed">Fale com um de nossos especialistas e receba uma simulação personalizada em poucos minutos.</p>
                    <div className="flex flex-col md:flex-row justify-center gap-6">
                        <a href="https://wa.me/5513997826694" className="bg-[#10b981] text-white px-12 py-6 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-110 transition-all flex items-center justify-center gap-4">
                            Simular via WhatsApp
                        </a>
                        <Link href="/contato" className="bg-slate-50 text-primary-900 border border-slate-100 px-12 py-6 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-primary-900 hover:text-white transition-all">
                            Enviar Documentação
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
