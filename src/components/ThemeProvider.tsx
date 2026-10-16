'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ThemeProvider() {
    const [theme, setTheme] = useState({
        primary_color: '#1B263B',
        button_color: '#1B263B'
    });

    useEffect(() => {
        const fetchStyles = async () => {
            const { data: themeData } = await supabase.from('site_settings').select('value').eq('key', 'site_theme').maybeSingle();
            if (themeData && themeData.value) applyTheme(themeData.value);

            const { data: faviconData } = await supabase.from('site_settings').select('value').eq('key', 'site_favicon').maybeSingle();
            if (faviconData && faviconData.value) applyFavicon(faviconData.value);
        };

        fetchStyles();
    }, []);

    const applyFavicon = (url: string) => {
        if (typeof document === 'undefined') return;
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = url;
    };

    const applyTheme = (themeData: any) => {
        if (typeof document !== 'undefined') {
            const root = document.documentElement;
            if (themeData.primary_color) {
                root.style.setProperty('--primary-color', themeData.primary_color);
            }
            if (themeData.button_color) {
                root.style.setProperty('--button-color', themeData.button_color);
            }
        }
    };

    return null; // Este componente apenas injeta estilos
}
