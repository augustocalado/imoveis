import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
        });

        if (!response.ok) throw new Error('Não foi possível acessar este link.');

        const html = await response.text();

        const extract = (regex: RegExp) => {
            const match = html.match(regex);
            return match ? match[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#8211;/g, '-').trim() : '';
        };

        const result = {
            title: extract(/<meta property="og:title" content="([^"]+)"/i) || extract(/<title>([^<]+)<\/title>/i),
            image: extract(/<meta property="og:image" content="([^"]+)"/i),
            excerpt: extract(/<meta property="og:description" content="([^"]+)"/i) || extract(/<meta name="description" content="([^"]+)"/i),
            source: new URL(url).hostname.replace('www.', '')
        };

        return NextResponse.json(result);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
