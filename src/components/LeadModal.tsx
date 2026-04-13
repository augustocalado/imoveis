'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, MessageSquare, Loader2, CheckCircle2, User, Phone } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

interface LeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    messagePrefix?: string;
}

export default function LeadModal({ isOpen, onClose, title = 'Fale com um Especialista', subtitle = 'Preencha os dados abaixo e entraremos em contato o mais rápido possível.', messagePrefix = 'Interesse geral via Home' }: LeadModalProps) {
    const [name, setName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);

        try {
            const { error: leadError } = await supabase
                .from('leads')
                .insert({
                    name: name,
                    customer_whatsapp: whatsapp,
                    message: messagePrefix,
                    status: 'novo'
                });

            if (leadError) throw leadError;

            // Envia notificação para o admin
            await supabase
                .from('notifications')
                .insert({
                    message: `Novo lead de: ${name}`,
                    type: 'lead_received'
                });

            setSent(true);
            setTimeout(() => {
                onClose();
                setSent(false);
                setName('');
                setWhatsapp('');
            }, 3000);

        } catch (err: any) {
            alert('Erro ao enviar contato: ' + err.message);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary-900/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[50px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500 border border-slate-100">
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all z-10"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="p-10 md:p-14">
                    {sent ? (
                        <div className="text-center space-y-8 py-10 animate-in zoom-in duration-500">
                            <div className="h-24 w-24 bg-accent rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-accent/20">
                                <CheckCircle2 className="h-12 w-12 text-white" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-primary-900 tracking-tighter uppercase">Mensagem Enviada!</h3>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Obrigado pelo contato, {name.split(' ')[0]}. Em breve falaremos com você.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            <header className="space-y-4">
                                <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                                    <MessageSquare className="h-7 w-7 text-accent" />
                                </div>
                                <h3 className="text-3xl font-black text-primary-900 tracking-tighter uppercase leading-none">{title}</h3>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{subtitle}</p>
                            </header>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Qual seu nome?</label>
                                        <div className="relative group">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-accent transition-colors" />
                                            <input
                                                required
                                                type="text"
                                                placeholder="Ex: João Silva"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 pl-14 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Seu WhatsApp</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-accent transition-colors" />
                                            <input
                                                required
                                                type="text"
                                                placeholder="(13) 99999-9999"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 pl-14 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                                                value={whatsapp}
                                                onChange={e => setWhatsapp(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className="w-full bg-primary-900 text-white py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary-900/20 hover:bg-accent transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50"
                                >
                                    {isSending ? <Loader2 className="h-6 w-6 animate-spin" /> : <MessageSquare className="h-6 w-6" />}
                                    Solicitar Contato
                                </button>
                                <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest mt-4">
                                    Ao clicar em solicitar, você concorda com nossa <Link href="/politica-de-privacidade" className="text-accent hover:underline">Política de Privacidade</Link> (LGPD).
                                </p>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
