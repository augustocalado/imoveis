'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, LayoutDashboard, LogOut, Phone, User, MessageCircle, Mail, Instagram, Facebook, Menu, Search, X, Youtube, Linkedin, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import NotificationBell from './NotificationBell';
import GlobalSearch from './GlobalSearch';
import clsx from 'clsx';

export default function Navbar() {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [visible, setVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [logoUrl, setLogoUrl] = useState('/logo.png');
    const [theme, setTheme] = useState({
        logo_height: 56,
        header_opacity: 100
    });
    const [contact, setContact] = useState({
        phone: '(13) 3474-0000',
        email: 'katiaeflavioimoveis@gmail.com',
        instagram: '#',
        facebook: '#',
        youtube: '#',
        linkedin: '#',
        whatsapp: ''
    });

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Hide on scroll down, show on scroll up
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setVisible(false);
            } else {
                setVisible(true);
            }
            
            setScrolled(currentScrollY > 20);
            setLastScrollY(currentScrollY);
        };
        window.addEventListener('scroll', handleScroll);

        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(profileData);
            }

            // Fetch dynamic settings
            const { data: settings } = await supabase
                .from('site_settings')
                .select('key, value');
            
            if (settings) {
                const logoSetting = settings.find(s => s.key === 'site_logo');
                if (logoSetting) setLogoUrl(logoSetting.value);
                
                const contactSetting = settings.find(s => s.key === 'site_contact');
                if (contactSetting) setContact(prev => ({ ...prev, ...contactSetting.value }));

                const themeSetting = settings.find(s => s.key === 'site_theme');
                if (themeSetting) setTheme(themeSetting.value);
            }
        };
        fetchData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchData();
            } else {
                setProfile(null);
            }
        });

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const navLinks = [
        { name: 'Início', href: '/' },
        { name: 'Comprar', href: '/catalogo' },
        { name: 'Alugar', href: '/imoveis?type=aluguel' },
        { name: 'Lançamentos', href: '/lancamentos' },
        { name: 'Bairros', href: '/bairros' },
        { name: 'Guias', href: '/comprar-imovel-em-praia-grande' },
        { name: 'Contato', href: '/contato' },
    ];

    if (pathname.startsWith('/admin') || pathname.startsWith('/corretor') || pathname.startsWith('/cliente')) return null;

    return (
        <header 
            className={clsx(
                "fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 border-b border-white/5",
                scrolled ? "shadow-2xl py-2" : "backdrop-blur-xl py-0",
                visible ? "translate-y-0" : "-translate-y-full"
            )}
            style={{ 
                backgroundColor: scrolled 
                    ? `color-mix(in srgb, var(--primary-color), transparent ${100 - (theme.header_opacity || 100)}%)` 
                    : `color-mix(in srgb, var(--primary-color), transparent ${100 - ((theme.header_opacity || 100) * 0.8)}%)`
            }}
        >
            {/* Upper bar for Social and Contact - Visibility Focus */}
            <div 
                className={`hidden md:flex backdrop-blur-md border-b border-white/5 py-1.5 transition-all h-auto opacity-100`}
                style={{ backgroundColor: contact.whatsapp ? 'rgba(0,0,0,0.4)' : 'transparent' }}
            >
                <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center text-[10px] font-extrabold uppercase tracking-[0.25em] text-white">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Phone className="h-2.5 w-2.5 text-accent" /> {contact.phone}
                        </div>
                        <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-white transition-colors lowercase">
                            <Mail className="h-2.5 w-2.5 text-accent" /> {contact.email}
                        </a>
                    </div>
                    <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                        <span>Siga-nos:</span>
                        {contact.instagram && contact.instagram !== '#' && <Link href={contact.instagram} target="_blank" aria-label="Seguir no Instagram" className="hover:text-accent transition-colors"><Instagram className="h-3 w-3" aria-hidden="true" /></Link>}
                        {contact.facebook && contact.facebook !== '#' && <Link href={contact.facebook} target="_blank" aria-label="Seguir no Facebook" className="hover:text-accent transition-colors"><Facebook className="h-3 w-3" aria-hidden="true" /></Link>}
                        {contact.youtube && contact.youtube !== '#' && <Link href={contact.youtube} target="_blank" aria-label="Inscrever-se no Youtube" className="hover:text-accent transition-colors"><Youtube className="h-3 w-3" aria-hidden="true" /></Link>}
                        {contact.linkedin && contact.linkedin !== '#' && <Link href={contact.linkedin} target="_blank" aria-label="Conectar no LinkedIn" className="hover:text-accent transition-colors"><Linkedin className="h-3 w-3" aria-hidden="true" /></Link>}
                    </div>
                </div>
            </div>

            <nav className="transition-all duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4 md:py-6 min-h-[64px]">
                        <div className="flex items-center">
                            <Link href="/" className="flex flex-col items-center justify-center group relative">
                                <img
                                    src={logoUrl}
                                    alt="Kátia e Flávio Imóveis"
                                    style={{ height: `${theme.logo_height || 56}px` }}
                                    className="w-auto object-contain brightness-110 drop-shadow-2xl"
                                />
                            </Link>
                        </div>

                        <div className="hidden lg:flex items-center gap-10">
                            <Link href="/catalogo" className="text-[12px] font-bold tracking-[0.2em] text-white hover:text-accent transition-all relative group py-2 uppercase">
                                Comprar
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
                            </Link>
                            <Link href="/imoveis?type=aluguel" className="text-[12px] font-bold tracking-[0.2em] text-white hover:text-accent transition-all relative group py-2 uppercase">
                                Alugar
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
                            </Link>
                            <Link href="/lancamentos" className="text-[12px] font-bold tracking-[0.2em] text-white hover:text-accent transition-all relative group py-2 uppercase">
                                Lançamentos
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
                            </Link>
                            <Link href="/sobre-nos" className="text-[12px] font-bold tracking-[0.2em] text-white hover:text-accent transition-all relative group py-2 uppercase">
                                Sobre Nós
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
                            </Link>
                            <Link href="/contato" className="text-[12px] font-bold tracking-[0.2em] text-white hover:text-accent transition-all relative group py-2 uppercase">
                                Contato
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
                            </Link>
                        </div>

                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                aria-label={isSearchOpen ? "Fechar busca" : "Abrir busca"}
                                aria-expanded={isSearchOpen}
                                className={clsx(
                                    "p-3 rounded-2xl transition-all shadow-xl active:scale-90",
                                    isSearchOpen ? "bg-accent text-white" : "bg-white/10 text-white hover:bg-white/20"
                                )}
                            >
                                {isSearchOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Search className="h-5 w-5" aria-hidden="true" />}
                            </button>
                            <div className="hidden md:block">
                                <NotificationBell />
                            </div>

                            <div className="flex items-center gap-4">
                                {user ? (
                                    <>
                                        <Link
                                            href={profile?.role === 'admin' ? '/admin' : profile?.role === 'corretor' ? '/corretor' : '/cliente'}
                                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition-all text-white border border-white/5 shadow-xl"
                                        >
                                            <LayoutDashboard className="h-5 w-5" />
                                            <span className="hidden md:block text-[12px] font-bold uppercase tracking-widest leading-none">Painel</span>
                                        </Link>
                                        <button
                                            onClick={handleSignOut}
                                            aria-label="Sair da conta"
                                            className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 active:scale-95 shadow-xl"
                                        >
                                            <LogOut className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </>
                                ) : (
                                     <div className="hidden md:flex items-center gap-3">
                                         <Link
                                             href="/login"
                                             className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-[12px] text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                                         >
                                             Entrar
                                         </Link>
                                         <Link
                                             href="/cadastro"
                                             className="flex bg-accent text-white px-8 py-3.5 rounded-2xl font-bold text-[12px] tracking-[0.2em] hover:bg-accent-hover transition-all shadow-xl shadow-accent/20 active:scale-95 items-center gap-2 uppercase"
                                         >
                                             <User className="h-4 w-4" />
                                             Cadastrar
                                         </Link>
                                     </div>
                                 )}

                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                                    aria-expanded={isMenuOpen}
                                    className="lg:hidden bg-white/10 p-3 rounded-2xl text-white hover:bg-white/20 transition-all border border-white/5 shadow-xl active:scale-90"
                                >
                                    {isMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Search Expandable Bar */}
                <div
                    className={clsx(
                        "overflow-hidden transition-all duration-500 ease-in-out bg-primary-900/95 backdrop-blur-2xl",
                        isSearchOpen ? "max-h-[300px] border-t border-white/5 opacity-100 py-10" : "max-h-0 opacity-0 py-0"
                    )}
                >
                    <div className="max-w-7xl mx-auto px-4">
                        <GlobalSearch onClose={() => setIsSearchOpen(false)} />
                    </div>
                </div>

                {/* Mobile Menu Drawer */}
                <div
                    className={clsx(
                        "fixed inset-0 z-[100] transition-all duration-500 lg:hidden",
                        isMenuOpen ? "pointer-events-auto" : "pointer-events-none"
                    )}
                >
                    <div
                        className={clsx(
                            "absolute inset-0 bg-primary-900/40 backdrop-blur-sm transition-opacity duration-500",
                            isMenuOpen ? "opacity-100" : "opacity-0"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <div
                        className={clsx(
                            "absolute top-0 right-0 w-80 h-screen bg-primary-900 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[-20px_0_50px_rgba(0,0,0,0.3)] border-l border-white/5 flex flex-col p-10",
                            isMenuOpen ? "translate-x-0" : "translate-x-full"
                        )}
                    >
                        <div className="flex justify-between items-center mb-16">
                            <span className="text-[12px] font-black uppercase tracking-[0.4em] text-accent">Menu</span>
                            <button onClick={() => setIsMenuOpen(false)} aria-label="Fechar menu" className="text-white hover:text-accent transition-colors"><X className="h-6 w-6" aria-hidden="true" /></button>
                        </div>

                        <nav className="flex flex-col gap-10">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-2xl font-black text-white hover:text-accent transition-all tracking-tighter uppercase flex items-center justify-between group"
                                >
                                    {link.name}
                                    <div className="h-10 w-10 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all" aria-hidden="true">
                                        <Menu className="h-4 w-4" />
                                    </div>
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-auto pt-10 border-t border-white/5 space-y-8">
                             {!user && (
                                 <div className="flex flex-col gap-4">
                                     <Link
                                         href="/login"
                                         onClick={() => setIsMenuOpen(false)}
                                         className="w-full bg-white/5 text-white py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-white/10 transition-all"
                                     >
                                         <User className="h-5 w-5" /> Fazer Login
                                     </Link>
                                     <Link
                                         href="/cadastro"
                                         onClick={() => setIsMenuOpen(false)}
                                         className="w-full bg-accent text-white py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-4 shadow-xl shadow-accent/20"
                                     >
                                         <Plus className="h-5 w-5" /> Criar Conta
                                     </Link>
                                 </div>
                             )}
                            <div className="flex items-center gap-6 justify-center text-white/40">
                                <Link href={contact.instagram} target="_blank" aria-label="Instagram" className="hover:text-white transition-colors cursor-pointer"><Instagram className="h-5 w-5" aria-hidden="true" /></Link>
                                <Link href={contact.facebook} target="_blank" aria-label="Facebook" className="hover:text-white transition-colors cursor-pointer"><Facebook className="h-5 w-5" aria-hidden="true" /></Link>
                                <Link href={`tel:${contact.phone.replace(/\D/g, '')}`} aria-label="Ligar para imobiliária" className="hover:text-white transition-colors cursor-pointer"><Phone className="h-5 w-5" aria-hidden="true" /></Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

