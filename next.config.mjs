/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    trailingSlash: false,
    images: {
        minimumCacheTTL: 31536000,
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'res.cloudinary.com' },
            { protocol: 'http', hostname: 'localhost' },
            { protocol: 'https', hostname: 'i.pravatar.cc' },
            { protocol: 'https', hostname: 'fuoipsehqjnpafhqjnyo.supabase.co' },
            { protocol: 'https', hostname: 'www.construtorajregarcia.com.br' },
            { protocol: 'https', hostname: 'imagens.ne10.uol.com.br' },
            { protocol: 'https', hostname: 's2-g1.glbimg.com' },
            { protocol: 'https', hostname: 'i.s3.glbimg.com' },
            { protocol: 'https', hostname: 's2-valor-investe.glbimg.com' },
            { protocol: 'https', hostname: 'logodownload.org' },
        ],
    },


    async headers() {
        return [
            {
                source: '/:path*\\.(jpg|jpeg|png|webp|avif|gif|svg|ico|woff2?|ttf|otf|eot)',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
            {
                source: '/_next/static/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
            {
                source: '/:path*',
                headers: [
                    { key: 'X-DNS-Prefetch-Control', value: 'on' },
                ],
            },
        ];
    },

    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Configuração de Proxies para ocultar o provedor de banco de dados do navegador
    async rewrites() {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!supabaseUrl) return [];

        return [
            {
                source: '/api/v1/:path*',
                destination: `${supabaseUrl}/rest/v1/:path*`,
            },
            {
                source: '/auth/v1/:path*',
                destination: `${supabaseUrl}/auth/v1/:path*`,
            },
            {
                source: '/storage/v1/:path*',
                destination: `${supabaseUrl}/storage/v1/:path*`,
            },
        ];
    },
};

export default nextConfig;