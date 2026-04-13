import type { Metadata } from "next";
import { Anek_Latin } from "next/font/google"; // Using Anek Latin which is in globals too
import "./globals.css";

const anekLatin = Anek_Latin({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
    variable: "--font-anek-latin",
});

export const metadata: Metadata = {
    title: {
        default: "Kátia e Flávio Imóveis | Imóveis em Praia Grande SP | Apartamentos à venda",
        template: "%s | Kátia e Flávio Imóveis",
    },
    description: "Encontre os melhores imóveis em Praia Grande com Kátia e Flávio Imóveis. Apartamentos, lançamentos e oportunidades no Canto do Forte, Boqueirão e toda região.",
    keywords: "imobiliária Praia Grande, apartamentos à venda Praia Grande, imóveis em Praia Grande SP, Kátia e Flávio Imóveis, casas Praia Grande, lançamentos Praia Grande, apartamento Boqueirão Praia Grande, Canto do Forte",
    authors: [{ name: "Kátia e Flávio Imóveis" }],
    creator: "Kátia e Flávio Imóveis",
    publisher: "Kátia e Flávio Imóveis",
    alternates: {
        canonical: 'https://katiaeflavioimoveis.com.br',
    },
    icons: {
        icon: '/logo.png',
        shortcut: '/logo.png',
        apple: '/logo.png',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: "website",
        locale: "pt_BR",
        url: "https://katiaeflavioimoveis.com.br",
        siteName: "Kátia e Flávio Imóveis",
        title: "Kátia e Flávio Imóveis | Oportunidades em Praia Grande SP",
        description: "Confira nosso catálogo completo de imóveis em Praia Grande e fale com um especialista agora mesmo.",
        images: [
            {
                url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200",
                width: 1200,
                height: 630,
                alt: "Kátia e Flávio Imóveis - Praia Grande",
            },
        ],
    },
    verification: {
        google: "ZTGtHF2hATLLuKXQv30vk-Lio6Ccn-dcGzuPHVMfm1Q",
    },
};

import Navbar from "@/components/Navbar";
import ThemeProvider from "@/components/ThemeProvider";
import SmartChat from "@/components/SmartChat";
import LGPDConsent from "@/components/LGPDConsent";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" className={anekLatin.variable}>
            <body className={`${anekLatin.className} antialiased`}>
                <ThemeProvider />
                <Navbar />
                <div className="flex flex-col min-h-screen">
                    {children}
                </div>
                <SmartChat />
                <LGPDConsent />
            </body>
        </html>
    );
}
