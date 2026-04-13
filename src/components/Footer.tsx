import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Mail, MapPin, Phone, Instagram, Facebook, ArrowRight, Loader2, CheckCircle2, Youtube, Linkedin } from 'lucide-react';

export default function Footer() {
    const [logoUrl, setLogoUrl] = useState('/logo.png');
    const [contact, setContact] = useState({
        phone: '(13) 3474-0000',
        email: 'katiaeflavioimoveis@gmail.com',
        address: 'Rua Fumio Miyazi, 141 - Sala 811 - Boqueirão',
        instagram: '#',
        facebook: '#',
        youtube: '#',
        whatsapp: ''
    });
    const [theme, setTheme] = useState({
        logo_height: 56
    });

    useEffect(() => {
        const fetchData = async () => {
            const { data } = await supabase.from('site_settings').select('key, value');
            if (data) {
                const logo = data.find(s => s.key === 'site_logo');
                if (logo) setLogoUrl(logo.value);
                const contactInfo = data.find(s => s.key === 'site_contact');
                if (contactInfo) setContact(prev => ({ ...prev, ...contactInfo.value }));
                const themeData = data.find(s => s.key === 'site_theme');
                if (themeData) setTheme(themeData.value);
            }
        };
        fetchData();
    }, []);

    return (
        <footer className="bg-primary-900 pt-32 pb-16 ">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 items-start">
                <div className="space-y-8">
                    <div className="flex flex-col">
                        <img
                            src={logoUrl}
                            alt="Kátia e Flávio Imóveis"
                            style={{ height: `${theme.logo_height || 56}px` }}
                            className="w-auto object-contain brightness-110 drop-shadow-2xl mb-6"
                        />
                        <p className="text-white/70 font-medium leading-relaxed mb-8 max-w-sm text-sm">
                            Kátia e Flávio Imóveis: Sua referência em imóveis de alto padrão e oportunidades exclusivas em Praia Grande SP.
                        </p>
                        <div className="flex gap-4">
                            {contact.instagram && <a href={contact.instagram} target="_blank" aria-label="Acessar nosso Instagram" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-accent hover:bg-white/10 transition-all border border-white/5"><Instagram className="h-4 w-4" aria-hidden="true" /></a>}
                            {contact.facebook && <a href={contact.facebook} target="_blank" aria-label="Acessar nosso Facebook" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-accent hover:bg-white/10 transition-all border border-white/5"><Facebook className="h-4 w-4" aria-hidden="true" /></a>}
                            {contact.youtube && <a href={contact.youtube} target="_blank" aria-label="Acessar nosso canal no Youtube" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-accent hover:bg-white/10 transition-all border border-white/5"><Youtube className="h-4 w-4" aria-hidden="true" /></a>}
                        </div>
                    </div>

                </div>

                <div className="space-y-6 md:pt-4">
                    <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-accent">Nossas Áreas</h2>
                    <ul className="space-y-3 text-sm font-semibold text-white/70">
                        <li><Link href="/imoveis?bairro=Canto do Forte" className="hover:text-white transition-colors">Imóveis no Canto do Forte</Link></li>
                        <li><Link href="/imoveis?bairro=Boqueirão" className="hover:text-white transition-colors">Apartamentos no Boqueirão</Link></li>
                        <li><Link href="/lancamentos" className="hover:text-white transition-colors">Lançamentos em Praia Grande</Link></li>
                        <li><Link href="/bairros" className="hover:text-white transition-colors text-accent">Bairros e Cidades</Link></li>
                        <li><Link href="/contato" className="hover:text-white transition-colors">Venda seu Imóvel</Link></li>
                    </ul>
                </div>

                <div className="space-y-6 md:pt-4">
                    <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-accent">Institucional</h2>
                    <ul className="space-y-4 text-sm font-bold text-white/70">
                        <li><Link href="/sobre-nos" className="hover:text-white transition-colors">Sobre Kátia e Flávio</Link></li>
                        <li><Link href="/contato" className="hover:text-white transition-colors">Fale Conosco</Link></li>
                        <li><Link href="/mapa-do-site" className="hover:text-white transition-colors">Mapa do Site</Link></li>
                        <li><Link href="/politica-de-privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link></li>
                        <li className="hover:text-white transition-colors cursor-pointer">Termos de Uso</li>
                    </ul>
                </div>

                <div className="space-y-8 md:pt-4">
                    <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-accent">Onde Estamos</h2>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4 text-white/70 group hover:text-white transition-colors">
                            <MapPin className="h-5 w-5 text-accent shrink-0" aria-hidden="true" />
                            <span className="text-[13px] leading-relaxed font-bold">{contact.address}</span>
                        </div>
                        <div className="flex items-center gap-4 text-white/70 group hover:text-white transition-colors">
                            <Phone className="h-5 w-5 text-accent shrink-0" aria-hidden="true" />
                            <span className="text-[13px] font-bold">{contact.phone}</span>
                        </div>
                        <div className="flex items-center gap-4 text-white/70 group hover:text-white transition-colors">
                            <Mail className="h-5 w-5 text-accent shrink-0" aria-hidden="true" />
                            <span className="text-[13px] font-bold">{contact.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4">
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[11px] font-bold text-white/50 uppercase tracking-[0.4em]">© 2026 KÁTIA E FLÁVIO IMÓVEIS - LUXURY REAL ESTATE. TODOS OS DIREITOS RESERVADOS.</p>
                    <div className="flex gap-4">
                        <img src="https://logodownload.org/wp-content/uploads/2015/05/creci-logo.png" className="h-8 opacity-20 grayscale brightness-200" alt="CRECI" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
