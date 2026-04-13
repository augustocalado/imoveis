'use client';

import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Instagram, Facebook, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function ContatoClient() {
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            setSent(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-white">
            <main className="pt-32 pb-40 ">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-20">
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.3em] text-accent">
                                <Mail className="h-4 w-4" />
                                <span>Canais de Atendimento</span>
                            </div>
                            <h1 className="text-7xl font-black text-primary-900 tracking-tighter leading-[0.8]">
                                Vamos conversar sobre o seu <span className="text-primary-600">novo lar?</span>
                            </h1>
                            <p className="text-lg text-gray-400 font-medium max-w-lg leading-relaxed pt-2">
                                Nossa equipe de especialistas está pronta para te atender com exclusividade e agilidade em Praia Grande SP.
                            </p>
                        </div>

                        <div className="space-y-8 pt-8 border-t border-slate-100">
                            <div className="flex items-start gap-8 group">
                                <div className="bg-primary-50 p-5 rounded-3xl text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-primary-900 uppercase tracking-widest">Telefone Central</h4>
                                    <p className="text-xl font-bold text-gray-500 hover:text-primary-600 transition-colors cursor-pointer">(13) 99782-6694 / 99679-4782</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-8 group">
                                <div className="bg-primary-50 p-5 rounded-3xl text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-primary-900 uppercase tracking-widest">Meridian Prime Offices</h4>
                                    <p className="text-xl font-bold text-gray-500 leading-tight">Rua Fumio Miyazi, 141 - Sala 811 - 8º andar - Boqueirão - Praia Grande/SP</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl hover:bg-primary-100 hover:text-primary-600 transition-all cursor-pointer">
                                <Instagram className="h-6 w-6" />
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl hover:bg-primary-100 hover:text-primary-600 transition-all cursor-pointer">
                                <Facebook className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-12 lg:p-16 rounded-[60px] border border-white shadow-2xl relative overflow-hidden">
                        {sent ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
                                <div className="bg-green-100 p-8 rounded-full text-green-600">
                                    <Send className="h-10 w-10" />
                                </div>
                                <h3 className="text-4xl font-black text-primary-900 tracking-tighter">Mensagem Enviada!</h3>
                                <p className="text-gray-500 font-medium">Obrigado pelo contato. Retornaremos em breve!</p>
                                <button onClick={() => setSent(false)} className="text-primary-600 font-black uppercase text-sm tracking-widest hover:underline pt-4">Enviar nova mensagem</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-black uppercase tracking-widest text-gray-400 ml-1">Seu Nome Completo</label>
                                        <input required type="text" placeholder="Nome" className="w-full bg-white p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all border border-transparent font-semibold shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-black uppercase tracking-widest text-gray-400 ml-1">E-mail de Contato</label>
                                        <input required type="email" placeholder="example@email.com" className="w-full bg-white p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all border border-transparent font-semibold shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-black uppercase tracking-widest text-gray-400 ml-1">WhatsApp</label>
                                        <input required type="tel" placeholder="(13) 00000-0000" className="w-full bg-white p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all border border-transparent font-semibold shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-black uppercase tracking-widest text-gray-400 ml-1">Mensagem</label>
                                        <textarea rows={4} placeholder="Como podemos te ajudar?" className="w-full bg-white p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all border border-transparent font-semibold shadow-sm resize-none" />
                                    </div>
                                </div>
                                <button type="submit" disabled={isSending} className="w-full bg-primary-900 text-white p-6 rounded-3xl font-black hover:bg-black transition-all shadow-xl shadow-primary-900/20 active:scale-95 flex items-center justify-center gap-4 group">
                                    {isSending ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Enviar Mensagem <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
