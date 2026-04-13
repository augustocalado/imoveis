"use client";

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { MessageSquare, MessageCircle, X, Send, ShieldCheck, ArrowRight, User, Phone, MapPin, Search, Home as HomeIcon } from 'lucide-react';
import clsx from 'clsx';
import { v4 as uuidv4 } from 'uuid';

type ChatMessage = {
    id: string;
    sender: 'bot' | 'user';
    text: string;
    options?: { label: string; action: string; value?: any }[];
    isForm?: boolean;
    formType?: 'name' | 'phone';
    time: string;
};

export default function SmartChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [context, setContext] = useState<any>({ type: 'general' });
    const [config, setConfig] = useState<any>({
        startOpen: false,
        autoOpenDelay: 8,
        botName: 'Catarina (IA)',
        initialMessage: "Olá! 👋 Sou Catarina, sua assistente virtual. Tá procurando um imóvel em Praia Grande pra comprar ou investir?",
        q1_label: '🔑 Quero comprar',
        q2_label: '💰 Quero vender',
        q3_label: '📊 Simular financiamento',
        q4_label: '📞 WhatsApp 24h',
        responseDelay: 1,
        faqs: []
    });
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Lead State
    const [lead, setLead] = useState({
        name: '',
        phone: '',
        interest: '',
        score: '❄️ Frio',
        profile_data: {} as any
    });

    const [currentFlow, setCurrentFlow] = useState('initial');
    const [hasCaptured, setHasCaptured] = useState(false);

    const lastInteractionTime = useRef<number>(Date.now());

    useEffect(() => {
        setSessionId(uuidv4());
        
        const initChat = async () => {
             const { data: dbConfig } = await supabase.from('site_settings').select('value').eq('key', 'chat_config').single();
             const conf = dbConfig?.value || config;
             setConfig(conf);
             
             if (pathname?.includes('/imovel/')) {
                 setTimeout(() => {
                     const titleEl = document.querySelector('h1');
                     const title = titleEl ? titleEl.innerText : 'este imóvel';
                     setContext({ type: 'property', title });
                     
                     addBotMessage(
                         `Esse imóvel aqui tá chamando atenção 👀\nQuer que eu te passe mais detalhes ou opções parecidas com ${title}?`,
                         [
                             { label: 'Ver mais detalhes', action: 'intent_property' },
                             { label: conf.q1_label || '🔑 Quero comprar', action: 'intent_buy' },
                             { label: conf.q3_label || '📊 Simular financiamento', action: 'intent_finance' }
                         ]
                     );
                 }, 1000);
             } else {
                 setContext({ type: 'general' });
                 addBotMessage(
                     conf.initialMessage || "Fala! 👋 Tá procurando imóvel pra comprar ou investir?",
                     [
                         { label: conf.q1_label || '🔑 Quero comprar', action: 'intent_buy' },
                         { label: conf.q2_label || '💰 Quero vender', action: 'intent_sell' },
                         { label: conf.q3_label || '📊 Simular financiamento', action: 'intent_finance' },
                         { label: conf.q4_label || '📞 Falar com corretor', action: 'intent_human' }
                     ]
                 );
             }

             if (conf.startOpen) {
                 setTimeout(() => {
                     setIsOpen(prev => {
                         if (!prev) return true;
                         return prev;
                     });
                 }, (conf.autoOpenDelay || 8) * 1000);
             }
        };

        if (!pathname?.startsWith('/admin')) {
             initChat();
        }
    }, [pathname]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const addBotMessage = (text: string, options?: ChatMessage['options'], isForm?: boolean, formType?: 'name' | 'phone') => {
        setIsTyping(true);
        const delay = (config.responseDelay || 2) * 1000;

        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: uuidv4(),
                sender: 'bot',
                text,
                options,
                isForm,
                formType,
                time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            }]);
            setIsTyping(false);
            lastInteractionTime.current = Date.now();
        }, delay);
    };

    const callChatAPI = async (message: string) => {
        setIsTyping(true);
        try {
            const history = messages.slice(-6).map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, history, name: lead.name })
            });

            if (!response.ok) throw new Error('API error');
            const data = await response.json();

            addBotMessage(data.text);
            
            if (data.score) {
                setLead(prev => ({ ...prev, score: data.score === 'QUENTE' ? '🔥 Quente' : data.score === 'MORNO' ? '🌡️ Morno' : '❄️ Frio' }));
            }
        } catch (error) {
            console.error("Chat Error:", error);
            addBotMessage("Tive um probleminha técnico aqui... mas pode me chamar no WhatsApp que te ajudo agora! 👇", [
                { label: 'Chamar no WhatsApp', action: 'go_whatsapp' }
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleUserAction = async (text: string, action: string, value?: any) => {
        setMessages(prev => [...prev, {
            id: uuidv4(),
            sender: 'user',
            text,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }]);
        lastInteractionTime.current = Date.now();
        
        if (action === 'go_whatsapp') {
            const msg = `Olá Catarina! Estava no site e quero saber mais sobre imóveis. ${lead.interest ? `Interesse: ${lead.interest}` : ''}`;
            window.open(`https://wa.me/5513997826694?text=${encodeURIComponent(msg)}`, '_blank');
            return;
        }

        await callChatAPI(text);
    };

    // The old processAction logic is now handled by the AI in /api/chat

    const handleTextInput = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const text = inputValue;
        setInputValue('');
        
        setMessages(prev => [...prev, {
            id: uuidv4(),
            sender: 'user',
            text,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }]);
        
        lastInteractionTime.current = Date.now();
        await callChatAPI(text);
    };

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end">
            <div 
                className={clsx(
                    "bg-white w-[350px] sm:w-[380px] rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 mb-4 overflow-hidden transition-all duration-500 origin-bottom-right flex flex-col",
                    isOpen ? "opacity-100 scale-100 translate-y-0 h-[600px] max-h-[80vh]" : "opacity-0 scale-95 translate-y-10 h-0 pointer-events-none"
                )}
            >
                <div className="bg-[#1B263B] p-5 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-[40px] rounded-full" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="relative">
                            <div className="w-12 h-12 bg-white rounded-full overflow-hidden border-2 border-accent">
                                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150" alt="Catarina" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#1B263B]" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-1">{config.botName || 'Catarina (IA)'} <ShieldCheck className="h-3 w-3 text-accent" /></h3>
                            <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Atendimento 24h
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 relative z-10">
                        <button 
                            onClick={() => handleUserAction('Quero falar no WhatsApp agora!', 'go_whatsapp')}
                            className="bg-[#25D366] text-white p-1.5 rounded-lg hover:scale-110 transition-transform shadow-lg"
                            title="Chamar no WhatsApp"
                        >
                            <MessageCircle className="h-4 w-4 fill-current" />
                        </button>
                        <button onClick={() => setIsOpen(false)} className="h-8 w-8 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-5 overflow-y-auto bg-slate-50/50 space-y-4 custom-scrollbar">
                    {messages.map((msg, i) => (
                        <div key={msg.id} className={clsx("flex flex-col max-w-[85%]", msg.sender === 'user' ? "self-end items-end" : "self-start items-start")}>
                            <div className={clsx(
                                "p-3.5 rounded-2xl shadow-sm text-[13px] font-medium leading-relaxed whitespace-pre-line",
                                msg.sender === 'user' 
                                    ? "bg-[#1B263B] text-white rounded-br-sm" 
                                    : "bg-white text-slate-700 rounded-bl-sm border border-slate-100"
                            )}>
                                {msg.text}
                            </div>
                            {msg.options && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {msg.options.map((opt, idx) => (
                                        <button 
                                            key={idx} 
                                            onClick={() => handleUserAction(opt.label, opt.action, opt.value)}
                                            className="bg-white border border-accent/20 text-primary-900 text-[11px] font-bold py-2 px-4 rounded-xl shadow-sm hover:bg-accent hover:text-white transition-colors uppercase tracking-wider"
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{msg.time}</span>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="self-start bg-white border border-slate-100 p-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1">
                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-slate-100">
                    <form onSubmit={handleTextInput} className="relative flex items-center">
                        <input 
                            type={messages[messages.length - 1]?.formType === 'phone' ? "tel" : "text"}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={messages[messages.length - 1]?.isForm ? "Digite sua resposta..." : "Digite aqui..."}
                            className="w-full bg-slate-100 border-none p-4 rounded-xl text-[13px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-accent/50 pr-12 transition-all"
                        />
                        <button 
                            type="submit" 
                            disabled={!inputValue.trim()}
                            className="absolute right-2 h-10 w-10 bg-[#1B263B] text-white rounded-lg flex items-center justify-center hover:bg-accent disabled:opacity-50 transition-colors shadow-md"
                        >
                            <Send className="h-4 w-4 translate-x-px translate-y-px" />
                        </button>
                    </form>
                    <div className="text-center mt-3 space-y-1">
                         <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-300">Inteligência Artificial Kátia e Flávio ⚡</p>
                         <p className="text-[7px] font-bold uppercase tracking-widest text-slate-400">
                            Ao conversar, você concorda com nossa <Link href="/politica-de-privacidade" className="text-accent hover:underline">Política de Privacidade</Link>.
                         </p>
                    </div>
                </div>
            </div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={clsx(
                    "h-16 w-16 rounded-full shadow-[0_15px_30px_-5px_rgba(37,211,102,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 relative group z-50 overflow-hidden",
                    isOpen ? "bg-[#1B263B] text-white" : "bg-[#25D366] text-white"
                )}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center justify-center">
                    {isOpen ? <X className="h-7 w-7 transition-transform duration-300" /> : <MessageCircle className="h-8 w-8 transition-transform duration-300 fill-current" />}
                </div>
                {!isOpen && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border-2 border-white animate-bounce shadow-lg">
                        24h
                    </div>
                )}
            </button>

            {!isOpen && (
                <div className={clsx(
                    "absolute right-20 bg-white text-primary-900 px-5 py-3 rounded-2xl shadow-xl border border-slate-100 font-bold text-xs tracking-wider uppercase transition-all duration-300 pointer-events-none flex items-center gap-2",
                    isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
                )}>
                    Atendimento 24h - Online
                    <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-slate-100 transform rotate-45" />
                </div>
            )}
        </div>
    );
}
