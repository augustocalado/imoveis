'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search, ChevronRight, Newspaper, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BlogListingPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('blog_posts')
                .select('*')
                .order('created_at', { ascending: false });
            if (data) setPosts(data);
            setLoading(false);
        };
        fetchPosts();
    }, []);

    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-[#fcfcfc]">
            <Navbar />

            {/* Hero Header */}
            <section className="bg-[#1B263B] pt-48 pb-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10" />
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <p className="text-accent font-bold text-[12px] uppercase tracking-[0.6em] mb-6">Blog & Notícias</p>
                    <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-12">
                        Informativo <br /><span className="text-accent">Kátia e Flávio</span>
                    </h1>
                    
                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 h-5 w-5 group-focus-within:text-accent transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Buscar artigos, dicas ou notícias..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-full py-6 pl-16 pr-8 text-white font-bold text-lg outline-none focus:ring-4 focus:ring-accent/20 transition-all placeholder:text-white/20"
                        />
                    </div>
                </div>
            </section>

            {/* Articles Grid */}
            <section className="py-32">
                <div className="container mx-auto px-6">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="animate-pulse space-y-6">
                                    <div className="h-64 bg-slate-100 rounded-[40px]" />
                                    <div className="h-4 w-1/4 bg-slate-100 rounded-full" />
                                    <div className="h-10 w-full bg-slate-100 rounded-2xl" />
                                    <div className="h-4 w-2/3 bg-slate-100 rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : filteredPosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filteredPosts.map((post) => (
                                <Link 
                                    key={post.id} 
                                    href={`/blog/${post.slug || post.id}`}
                                    className="group"
                                >
                                    <article className="bg-white rounded-[40px] overflow-hidden group border border-slate-100 p-2 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                                        <div className="h-64 overflow-hidden rounded-[32px] mb-6 relative">
                                            <img 
                                                src={post.image_url || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d'} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" 
                                                alt={post.title} 
                                            />
                                            <div className="absolute top-6 left-6 bg-[#1B263B]/80 backdrop-blur-md px-4 py-2 rounded-xl text-white text-[10px] font-black uppercase tracking-widest border border-white/10">
                                                Tendência
                                            </div>
                                        </div>
                                        <div className="p-6 pt-0 space-y-4">
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                                <span className="h-1 w-1 rounded-full bg-accent" />
                                                <span>5 min read</span>
                                            </div>
                                            <h3 className="text-xl font-black text-primary-900 leading-tight group-hover:text-accent transition-colors">{post.title}</h3>
                                            <p className="text-sm text-slate-400 font-medium line-clamp-3 leading-relaxed">
                                                {post.excerpt || post.content?.substring(0, 150)}
                                            </p>
                                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                                <span className="text-[12px] font-black uppercase tracking-widest text-[#1B263B] group-hover:text-accent transition-all flex items-center gap-2">
                                                    Ler completo <ArrowRight className="h-4 w-4" />
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-32 text-center bg-white rounded-[60px] border border-dashed border-slate-100 max-w-4xl mx-auto">
                            <Newspaper className="h-20 w-20 text-slate-100 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-primary-900 uppercase tracking-tighter mb-4">Nenhum artigo encontrado</h3>
                            <p className="text-slate-400 font-bold mb-8">Tente buscar por termos diferentes ou explore outros temas.</p>
                            <button onClick={() => setSearchTerm('')} className="text-accent font-black text-sm uppercase tracking-widest underline">Ver todos os posts</button>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
