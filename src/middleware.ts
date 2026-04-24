import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();
    const host = req.headers.get('host');

    // 1. Force WWW redirect (Production only or if host is specified)
    if (process.env.NODE_ENV === 'production' && host && !host.startsWith('www.') && !host.includes('localhost') && !host.includes('vercel.app')) {
        return NextResponse.redirect(`https://www.katiaeflavioimoveis.com.br${url.pathname}${url.search}`, 301);
    }

    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    // If session doesn't exist and user is trying to access protected routes
    if (!session && (
        url.pathname.startsWith('/admin') ||
        url.pathname.startsWith('/corretor') ||
        url.pathname.startsWith('/cliente')
    )) {
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // RBAC redirection logic
    if (session) {
        const role = session.user.user_metadata?.role || 'cliente';
        const isApproved = session.user.user_metadata?.is_approved !== false; // Considera approved se não for explicitamente false (fallback)

        // Block unapproved brokers
        if (role === 'corretor' && !isApproved && !url.pathname.startsWith('/pendente')) {
            url.pathname = '/login';
            url.searchParams.set('pending', 'true');
            return NextResponse.redirect(url);
        }

        // Prevent cross-dashboard access
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

        // Redirect /login to dashboard ONLY if not already coming from a redirect loop or pending state
        if (url.pathname === '/login' && !url.searchParams.has('pending')) {
            url.pathname = `/${role}`;
            return NextResponse.redirect(url);
        }
    }

    return res;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
