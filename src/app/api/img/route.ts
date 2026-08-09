import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

const ALLOWED_HOSTS = new Set([
    'fuoipsehqjnpafhqjnyo.supabase.co',
    'images.unsplash.com',
    'res.cloudinary.com',
    'i.pravatar.cc',
    'www.construtorajregarcia.com.br',
    'imagens.ne10.uol.com.br',
    's2-g1.glbimg.com',
    'i.s3.glbimg.com',
    's2-valor-investe.glbimg.com',
]);

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const src = searchParams.get('url');
    const widthParam = parseInt(searchParams.get('w') || '0', 10);
    const quality = Math.min(Math.max(parseInt(searchParams.get('q') || '70', 10) || 70, 1), 90);

    if (!src) return new NextResponse('Missing url', { status: 400 });

    let upstream: URL;
    try {
        upstream = new URL(src);
    } catch {
        return new NextResponse('Invalid url', { status: 400 });
    }

    if (!ALLOWED_HOSTS.has(upstream.hostname)) {
        return new NextResponse('Host not allowed', { status: 403 });
    }

    let upstreamRes;
    try {
        upstreamRes = await fetch(src, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
    } catch {
        return new NextResponse('Upstream error', { status: 502 });
    }
    if (!upstreamRes.ok) return new NextResponse(`Upstream ${upstreamRes.status}`, { status: 502 });

    const contentType = upstreamRes.headers.get('content-type') || 'image/jpeg';
    const original = Buffer.from(await upstreamRes.arrayBuffer());

    if (!contentType.startsWith('image/')) {
        return new NextResponse(original, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Vary': 'Accept',
            },
        });
    }

    const acceptsWebp = req.headers.get('accept')?.includes('image/webp');

    try {
        let pipeline = sharp(original, { failOn: 'none' }).rotate();
        const width = widthParam > 0 ? widthParam : null;
        if (width) pipeline = pipeline.resize({ width, withoutEnlargement: true });

        let out: Buffer;
        let outType: string;
        if (acceptsWebp) {
            out = await pipeline.webp({ quality }).toBuffer();
            outType = 'image/webp';
        } else {
            out = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
            outType = 'image/jpeg';
        }

        return new NextResponse(out, {
            headers: {
                'Content-Type': outType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Vary': 'Accept',
            },
        });
    } catch {
        return new NextResponse(original, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Vary': 'Accept',
            },
        });
    }
}
