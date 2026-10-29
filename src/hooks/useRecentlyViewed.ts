'use client';

import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'kfe_recently_viewed';
const MAX_ITEMS = 12;

export interface RecentlyViewedItem {
    id: string;
    slug: string;
    title: string;
    price: number;
    neighborhood: string;
    city: string;
    category: string;
    rooms: number;
    area: number;
    parking_spaces: number;
    images: string[];
    reference_id: string;
    viewedAt: number;
}

/**
 * Função segura para disparar eventos para o Google Tag / Google Ads gtag.js
 */
export function safeGtag(eventName: string, params: Record<string, any> = {}) {
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
        try {
            (window as any).gtag('event', eventName, params);
        } catch (err) {
            console.debug('[Google Ads Gtag]', err);
        }
    }
}

function readStorage(): RecentlyViewedItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeStorage(items: RecentlyViewedItem[]) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch { /* silent */ }
}

/**
 * Registra um imóvel como visitado no localStorage E dispara evento no Google Ads (Remarketing Dinâmico).
 */
export function trackPropertyView(prop: any) {
    if (typeof window === 'undefined' || !prop?.id) return;

    const item: RecentlyViewedItem = {
        id: prop.id,
        slug: prop.slug,
        title: prop.title,
        price: prop.price || 0,
        neighborhood: prop.neighborhood || '',
        city: prop.city || '',
        category: prop.category || prop.type || 'Imóvel',
        rooms: prop.rooms || 0,
        area: prop.area || 0,
        parking_spaces: prop.parking_spaces || 0,
        images: prop.images || [],
        reference_id: prop.reference_id || prop.id.slice(0, 8),
        viewedAt: Date.now(),
    };

    const current = readStorage().filter(p => p.id !== prop.id);
    const updated = [item, ...current].slice(0, MAX_ITEMS);
    writeStorage(updated);

    // Dispara evento para sincronizar todos os componentes React
    window.dispatchEvent(new Event('kfe-recently-viewed-update'));

    // Dispara evento para o Google Ads Remarketing (Rede de Display)
    // O dynx_itemid e dynx_pagetype são os parâmetros oficiais de Remarketing Dinâmico do Google para Imóveis
    safeGtag('view_item', {
        dynx_itemid: prop.reference_id || prop.id,
        dynx_pagetype: 'offerdetail',
        dynx_totalvalue: prop.price || 0,
        value: prop.price || 0,
        currency: 'BRL',
        items: [{
            id: prop.reference_id || prop.id,
            name: prop.title || 'Imóvel',
            category: prop.category || prop.type,
            price: prop.price || 0,
            city: prop.city,
            neighborhood: prop.neighborhood
        }]
    });
}

/**
 * Dispara evento de pesquisa no Google Ads Remarketing (Rede de Display)
 */
export function trackPropertySearch(searchTerm: string, filters: Record<string, any> = {}) {
    safeGtag('view_search_results', {
        dynx_pagetype: 'searchresults',
        search_term: searchTerm,
        ...filters
    });
}

/**
 * Dispara conversão de Lead / Contato (WhatsApp, Formulário) no Google Ads
 */
export function trackLeadConversion(details: {
    source: string;
    propertyId?: string;
    propertyTitle?: string;
    value?: number;
}) {
    safeGtag('generate_lead', {
        event_category: 'Lead',
        event_label: details.source,
        dynx_itemid: details.propertyId || '',
        dynx_pagetype: 'conversion',
        value: details.value || 1.0,
        currency: 'BRL',
    });
}

/**
 * Hook que retorna a lista dos imóveis recentemente vistos.
 * Reage a atualizações em tempo real (mesmo cross-tab via storage event).
 */
export function useRecentlyViewed(excludeId?: string) {
    const [items, setItems] = useState<RecentlyViewedItem[]>([]);

    const sync = useCallback(() => {
        const list = readStorage();
        setItems(excludeId ? list.filter(p => p.id !== excludeId) : list);
    }, [excludeId]);

    useEffect(() => {
        sync();
        window.addEventListener('kfe-recently-viewed-update', sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener('kfe-recently-viewed-update', sync);
            window.removeEventListener('storage', sync);
        };
    }, [sync]);

    const clear = useCallback(() => {
        writeStorage([]);
        window.dispatchEvent(new Event('kfe-recently-viewed-update'));
    }, []);

    return { items, clear };
}
