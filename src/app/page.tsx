import HomeClient from '@/components/HomeClient';
import { supabaseServer } from '@/lib/supabase-server';

export default async function Home() {
    // Fetch all data on the server
    const [
        heroRes,
        configRes,
        propsRes,
        blogRes,
        neighborRes,
        hqRes,
        contactRes,
        specsRes,
        partnersRes
    ] = await Promise.all([
        supabaseServer.from('site_settings').select('value').eq('key', 'home_hero').single(),
        supabaseServer.from('site_settings').select('value').eq('key', 'home_config').single(),
        supabaseServer.from('properties')
            .select('*, profiles!corretor_id(full_name)')
            .in('status', ['disponivel', 'disponível', 'Disponivel', 'Disponível'])
            .eq('is_featured', true)
            .limit(100),
        supabaseServer.from('blog_posts').select('*').order('created_at', { ascending: false }).limit(3),
        supabaseServer.from('properties').select('neighborhood').not('neighborhood', 'is', null),
        supabaseServer.from('site_settings').select('value').eq('key', 'home_hq').single(),
        supabaseServer.from('site_settings').select('value').eq('key', 'site_contact').single(),
        supabaseServer.from('site_settings').select('value').eq('key', 'property_specs').single(),
        supabaseServer.from('partners').select('*').order('created_at', { ascending: false })
    ]);

    // Data processing
    const heroSettings = heroRes.data?.value || {
        title: 'Encontre seu imóvel \nna Praia Grande \ncom atendimento rápido',
        subtitle: 'As melhores oportunidades no Canto do Forte, Boqueirão e toda região da Baixada Santista.',
        image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1920',
        title_font_size: 72
    };

    const homeConfig = configRes.data?.value || {
        horizontal_count: 8,
        vertical_count: 6,
        show_horizontal: true,
        show_vertical: true,
        horizontal_title: 'Destaques Exclusive',
        vertical_title: 'Oportunidades em Praia Grande',
        grid_columns: 4
    };

    const properties = propsRes.data ? [...propsRes.data].sort(() => 0.5 - Math.random()) : [];
    const blogPosts = blogRes.data || [];
    
    const neighborhoods = neighborRes.data 
        ? Array.from(new Set(neighborRes.data.map((p: any) => p.neighborhood))) as string[]
        : [];
    neighborhoods.sort();

    const hqSettings = hqRes.data?.value || {
        hq_title: 'Nossa Sede em Praia Grande',
        hq_description: 'Venha nos visitar e conhecer as melhores oportunidades imobiliárias pessoalmente.',
        hq_maps_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3648.4682014844397!2d-46.4172448!3d-24.004944!2m3!1f0!2f0!3f3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce1c4f00000001%3A0x0!2zMjTCsDAwJzE3LjgiUyA0NsKwMjUnMDIuMSJX!5e0!3m2!1spt-BR!2sbr!4v1714589254321!5m2!1spt-BR!2sbr'
    };

    const siteContact = contactRes.data?.value || {
        phone: '(13) 3474-0000',
        email: 'vendas@kfimoveis.com.br',
        address: 'Canto do Forte, PG - SP'
    };

    const specs = specsRes.data?.value || [
        { id: 'area', label: 'Área', field: 'area', icon: 'Maximize2', suffix: 'm²' },
        { id: 'rooms', label: 'Dorm', field: 'rooms', icon: 'Bed' },
        { id: 'suites', label: 'Suítes', field: 'suites', icon: 'BedDouble' },
        { id: 'bathrooms', label: 'Banheiros', field: 'bathrooms', icon: 'Bath' },
        { id: 'parking', label: 'Vagas', field: 'parking_spaces', icon: 'Car' }
    ];

    const partners = partnersRes.data || [];

    // Schema.org Data for Local SEO (Standardized to www)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        "name": "Kátia e Flávio Imóveis",
        "image": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200",
        "@id": "https://www.katiaeflavioimoveis.com.br",
        "url": "https://www.katiaeflavioimoveis.com.br",
        "telephone": "+551334740000",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Canto do Forte",
            "addressLocality": "Praia Grande",
            "addressRegion": "SP",
            "postalCode": "11700-000",
            "addressCountry": "BR"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": -24.00,
            "longitude": -46.40
        },
        "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "opens": "09:00",
            "closes": "18:00"
        },
        "sameAs": [
            "https://www.facebook.com/katiaeflavioimoveis",
            "https://www.instagram.com/katiaeflavioimoveis"
        ]
    };

    const initialData = {
        heroSettings,
        homeConfig,
        properties,
        blogPosts,
        neighborhoods,
        hqSettings,
        siteContact,
        specs,
        partners
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <HomeClient initialData={initialData} />
        </>
    );
}
