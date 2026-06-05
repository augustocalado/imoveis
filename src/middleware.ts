import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();
    const host = req.headers.get('host');

    // Force WWW redirect (Production only)
    if (process.env.NODE_ENV === 'production' && host && !host.startsWith('www.') && !host.includes('localhost') && !host.includes('vercel.app')) {
        return NextResponse.redirect(`https://www.katiaeflavioimoveis.com.br${url.pathname}${url.search}`, 301);
    }

    const res = NextResponse.next();

    // Timeout the session check to avoid hanging the whole site
    const session = await Promise.race([
        (async () => {
            try {
                const supabase = createMiddlewareClient({ req, res });
                const { data: { session: s } } = await supabase.auth.getSession();
                return s;
            } catch {
                return null;
            }
        })(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
    ]);

    if (!session) {
        if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/corretor') || url.pathname.startsWith('/cliente')) {
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }
        return res;
    }

    const role = session.user.user_metadata?.role || 'cliente';
    const isApproved = session.user.user_metadata?.is_approved !== false;

    if (role === 'corretor' && !isApproved && !url.pathname.startsWith('/pendente')) {
        url.pathname = '/login';
        url.searchParams.set('pending', 'true');
        return NextResponse.redirect(url);
    }

    if (url.pathname.startsWith('/admin')) {
        const isBrokerPropertyPath = role === 'corretor' && url.pathname.startsWith('/admin/imoveis');
        if (role !== 'admin' && !isBrokerPropertyPath) {
            url.pathname = `/${role}`;
            return NextResponse.redirect(url);
        }
    }
    if (url.pathname.startsWith('/corretor') && role !== 'corretor' && role !== 'admin') {
        url.pathname = `/${role}`;
        return NextResponse.redirect(url);
    }
    if (url.pathname.startsWith('/cliente') && role !== 'cliente' && role !== 'admin') {
        url.pathname = `/${role}`;
        return NextResponse.redirect(url);
    }

    if (url.pathname === '/login' && !url.searchParams.has('pending')) {
        url.pathname = `/${role}`;
        return NextResponse.redirect(url);
    }

    return res;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
