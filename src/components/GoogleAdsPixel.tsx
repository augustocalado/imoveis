'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * GoogleAdsPixel
 *
 * Injeta o Google Tag (gtag.js) e o pixel de Remarketing do Google Ads.
 * O Tag ID é lido da tabela site_settings (chave: 'google_ads_config').
 * Só é injetado se o usuário aceitou o consentimento LGPD.
 */
export default function GoogleAdsPixel() {
    const [config, setConfig] = useState<{ tag_id?: string; enabled?: boolean } | null>(null);
    const [hasConsent, setHasConsent] = useState(false);

    useEffect(() => {
        // Verifica consentimento LGPD
        const consent = localStorage.getItem('lgpd-consent-v1');
        setHasConsent(consent === 'accepted');

        // Escuta aceitação em tempo real (caso o usuário aceite enquanto está na página)
        const onConsent = () => {
            const c = localStorage.getItem('lgpd-consent-v1');
            setHasConsent(c === 'accepted');
        };
        window.addEventListener('lgpd-consent-accepted', onConsent);
        window.addEventListener('storage', onConsent);
        return () => {
            window.removeEventListener('lgpd-consent-accepted', onConsent);
            window.removeEventListener('storage', onConsent);
        };
    }, []);

    useEffect(() => {
        const fetchConfig = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'google_ads_config')
                .maybeSingle();
            if (data?.value) setConfig(data.value);
        };
        fetchConfig();
    }, []);

    // Não injeta se: sem consentimento, sem config, desabilitado, ou sem tag ID
    if (!hasConsent || !config?.enabled || !config?.tag_id) return null;

    const tagId = config.tag_id.trim();

    return (
        <>
            {/* Google Tag (gtag.js) */}
            <Script
                id="google-gtag-js"
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${tagId}`}
            />
            <Script
                id="google-gtag-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${tagId}', {
                            send_page_view: true,
                            allow_google_signals: true,
                            allow_ad_personalization_signals: true
                        });
                    `,
                }}
            />
        </>
    );
}

