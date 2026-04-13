'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, User, Clock, ChevronLeft, Share2, Facebook, Instagram, MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BlogPostPage() {
    const { slug } = useParams();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [relatedPosts, setRelatedPosts] = useState<any[]>([]);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            // Tenta buscar por slug primeiro, se for um número tenta por ID
            const isId = !isNaN(Number(slug));
            const query = isId 
                ? supabase.from('blog_posts').select('*').eq('id', slug).single()
                : supabase.from('blog_posts').select('*').eq('slug', slug).single();

            const { data, error } = await query;
            if (data) {
                setPost(data);
                // Buscar posts relacionados (mesma categoria ou apenas os mais recentes)
                const { data: related } = await supabase
                    .from('blog_posts')
                    .select('*')
                    .neq('id', data.id)
                    .limit(3);
                setRelatedPosts(related || []);
            }
            setLoading(false);
        };

        if (slug) fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-accent border-t-transparent animate-spin" />
                    <p className="text-[12px] font-black uppercase tracking-[0.4em] text-primary-900">Carregando Artigo...</p>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-black text-primary-900 uppercase tracking-tighter mb-4">Artigo não encontrado</h1>
                <p className="text-slate-400 font-bold mb-8">O conteúdo que você procura não existe ou foi removido.</p>
                <Link href="/" className="bg-[#1B263B] text-white px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:scale-105 transition-all">
                    Voltar para o Início
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#fcfcfc]">
            <Navbar />

            {/* Sticky Share Bar (Desktop) */}
            <div className="hidden lg:flex fixed left-10 top-1/2 -translate-y-1/2 flex-col gap-4 z-50">
                <button className="h-12 w-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-400 hover:text-accent hover:-translate-y-1 transition-all"><Facebook className="h-5 w-5" /></button>
                <button className="h-12 w-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-400 hover:text-accent hover:-translate-y-1 transition-all"><Instagram className="h-5 w-5" /></button>
                <button className="h-12 w-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-400 hover:text-accent hover:-translate-y-1 transition-all"><Share2 className="h-5 w-5" /></button>
            </div>

            {/* Hero Section */}
            <section className="relative h-[70vh] w-full overflow-hidden">
                <img 
                    src={post.image_url || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d'} 
                    className="w-full h-full object-cover"
                    alt={post.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#fcfcfc] via-primary-900/60 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-20">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-accent hover:text-white transition-colors mb-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                            <ChevronLeft className="h-3 w-3" /> Voltar ao Início
                        </Link>
                        
                        <div className="flex flex-wrap gap-4 items-center text-[11px] font-black uppercase tracking-[0.3em] text-white/80">
                            <span className="flex items-center gap-2"><Calendar className="h-3 w-3 text-accent" /> {new Date(post.created_at).toLocaleDateString()}</span>
                            <span className="h-1 w-1 rounded-full bg-accent" />
                            <span className="flex items-center gap-2"><User className="h-3 w-3 text-accent" /> Admin KF Imóveis</span>
                            <span className="h-1 w-1 rounded-full bg-accent" />
                            <span className="flex items-center gap-2"><Clock className="h-3 w-3 text-accent" /> 5 min de leitura</span>
                        </div>

                        <h1 className="text-4xl md:text-7xl font-black text-white md:text-[#1B263B] leading-[0.9] tracking-tighter uppercase drop-shadow-2xl">
                            {post.title}
                        </h1>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20">
                    
                    {/* Main Content */}
                    <div className="lg:col-span-12">
                        <div className="bg-white rounded-[60px] p-8 md:p-20 shadow-2xl shadow-slate-200/50 border border-slate-100">
                            <div className="prose prose-slate prose-xl max-w-none">
                                <p className="text-xl md:text-2xl font-bold text-slate-500 mb-12 italic leading-relaxed border-l-4 border-accent pl-8">
                                    {post.excerpt}
                                </p>
                                <div 
                                    className="text-slate-600 leading-[1.8] font-medium text-lg whitespace-pre-wrap space-y-8"
                                    dangerouslySetInnerHTML={{ __html: post.content }} 
                                />
                            </div>

                            {/* Author Box */}
                            <div className="mt-20 pt-20 border-t border-slate-100 flex flex-col md:flex-row items-center gap-10">
                                <div className="h-24 w-24 rounded-[32px] bg-primary-900 border-4 border-white shadow-xl overflow-hidden shrink-0">
                                    <img src="https://i.pravatar.cc/150?u=kfimoveis" className="w-full h-full object-cover" alt="Author" />
                                </div>
                                <div className="space-y-2 text-center md:text-left">
                                    <span className="text-[10px] font-black text-accent uppercase tracking-[0.5em]">Escrito por</span>
                                    <h4 className="text-xl font-black text-primary-900 uppercase tracking-tighter">Equipe Kátia e Flávio Imóveis</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed font-bold">Especialistas no mercado imobiliário de luxo e investimentos em Praia Grande SP, trazendo as melhores dicas e notícias para você.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Posts */}
            <section className="py-32 bg-slate-50 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-16">
                        <div>
                            <p className="text-accent font-bold text-[12px] uppercase tracking-[0.5em] mb-4">Leia Também</p>
                            <h2 className="text-4xl font-black text-primary-900 uppercase tracking-tighter">Artigos Relacionados</h2>
                        </div>
                        <Link href="/" className="hidden md:flex h-14 w-14 bg-white rounded-2xl shadow-xl items-center justify-center text-primary-900 hover:bg-primary-900 hover:text-white transition-all">
                            <ArrowRight className="h-6 w-6" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {relatedPosts.map((rPost) => (
                            <Link 
                                key={rPost.id} 
                                href={`/blog/${rPost.slug || rPost.id}`}
                                className="group"
                            >
                                <div className="bg-white p-3 rounded-[40px] border border-slate-100 hover:shadow-2xl transition-all duration-500">
                                    <div className="h-56 rounded-[32px] overflow-hidden mb-6 relative">
                                        <img src={rPost.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" alt={rPost.title} />
                                        <div className="absolute inset-0 bg-primary-900/20 group-hover:bg-transparent transition-all" />
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <h3 className="text-lg font-black text-primary-900 uppercase tracking-tight leading-tight group-hover:text-accent transition-colors">{rPost.title}</h3>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(rPost.created_at).toLocaleDateString()}</span>
                                            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all"><ArrowRight className="h-4 w-4" /></div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter Call to Action */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto bg-primary-900 rounded-[80px] p-12 md:p-32 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10" />
                    <div className="relative z-10 space-y-12">
                        <MessageCircle className="h-16 w-16 text-accent mx-auto" />
                        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                            Dúvidas sobre o mercado <br /><span className="text-accent underline">imobiliário?</span>
                        </h2>
                        <p className="text-white/40 font-bold text-lg max-w-2xl mx-auto uppercase tracking-widest leading-relaxed">Fale agora com um de nossos corretores especialistas e receba uma consultoria exclusiva.</p>
                        <div className="flex flex-col md:flex-row justify-center gap-6">
                            <Link href="https://wa.me/5513997826694" className="bg-[#10b981] text-white px-12 py-6 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-4">
                                <MessageCircle className="h-5 w-5 fill-white" /> Conversar no WhatsApp
                            </Link>
                            <Link href="/contato" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-12 py-6 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-white hover:text-primary-900 transition-all">
                                Fale Conosco
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
