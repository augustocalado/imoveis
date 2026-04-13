'use client';

import Footer from '@/components/Footer';
import { Home, Users, Target, Shield, ArrowRight, Award, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SobreNosClient() {
    const [isLoading, setIsLoading] = useState(true);
    const [content, setContent] = useState({
        title: 'Sua parceira de sucesso em Praia Grande.',
        subtitle: 'Mais que uma imobiliária, sua escolha estratégica.',
        text_1: 'Fundada com o propósito de transformar o mercado imobiliário da Baixada Santista, nossa empresa consolidou-se como referência em imóveis de alto padrão e investimentos seguros em Praia Grande.',
        text_2: 'Nossa equipe é formada por especialistas que entendem profundamente a dinâmica local, garantindo que cada cliente não apenas encontre um imóvel, mas realize um investimento estratégico para o futuro de sua família.',
        image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=1200',
        years_of_history: '15+'
    });

    useEffect(() => {
        const fetchContent = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'about_us')
                .single();
            if (data) setContent(data.value);
            setIsLoading(false);
        };
        fetchContent();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <main className="pt-32 pb-20 ">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.3em] text-accent mb-6">
                        <Users className="h-4 w-4" />
                        <span>Sobre Kátia e Flávio</span>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-black text-primary-900 tracking-tighter mb-16 max-w-5xl leading-[0.85] uppercase">
                        {content.subtitle} <span className="text-primary-600">{content.title}</span>
                    </h1>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-40">
                        <div className="relative h-[650px] rounded-[60px] overflow-hidden shadow-2xl">
                            <img
                                src={content.image_url}
                                className="w-full h-full object-cover"
                                alt="Nossa História"
                            />
                            <div className="absolute top-10 right-10 bg-white p-8 rounded-[40px] shadow-2xl flex flex-col items-center">
                                <span className="text-5xl font-black text-primary-600 tracking-tighter">{content.years_of_history}</span>
                                <span className="text-[12px] font-black uppercase text-gray-400 tracking-widest mt-1">Anos de História</span>
                            </div>
                        </div>
                        <div className="space-y-10">
                            <h2 className="text-4xl font-black text-primary-900 tracking-tighter leading-tight uppercase">Excelência em cada detalhe, transparência em cada contrato.</h2>
                            <p className="text-lg text-gray-500 font-medium leading-relaxed">
                                {content.text_1}
                            </p>
                            <p className="text-lg text-gray-500 font-medium leading-relaxed">
                                {content.text_2}
                            </p>
                            <div className="pt-8 grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="bg-primary-50 w-12 h-12 rounded-2xl flex items-center justify-center text-primary-600">
                                        <Award className="h-6 w-6" />
                                    </div>
                                    <h4 className="text-sm font-black text-primary-900 uppercase tracking-widest leading-none">Ética & Rigor</h4>
                                    <p className="text-sm text-gray-400 font-semibold uppercase leading-relaxed">Comprometimento com a transparência total em todas as etapas.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-primary-50 w-12 h-12 rounded-2xl flex items-center justify-center text-primary-600">
                                        <Shield className="h-6 w-6" />
                                    </div>
                                    <h4 className="text-sm font-black text-primary-900 uppercase tracking-widest leading-none">Segurança Jurídica</h4>
                                    <p className="text-sm text-gray-400 font-semibold uppercase leading-relaxed">Análise rigorosa de toda a documentação imobiliária.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary-900 rounded-[80px] p-20 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent transition-opacity group-hover:opacity-60 duration-1000" />
                        <div className="relative z-10 space-y-10">
                            <h2 className="text-5xl font-black text-white tracking-tighter max-w-2xl mx-auto leading-[0.9]">Pronto para encontrar o seu próximo grande investimento?</h2>
                            <Link href="/contato" className="inline-flex bg-accent text-white px-12 py-6 rounded-3xl font-black hover:bg-white hover:text-primary-900 transition-all shadow-xl active:scale-95 group/btn">
                                Falar com um Especialista
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
