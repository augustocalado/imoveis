import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // Fetch all available properties
        const { data: properties, error } = await supabase
            .from('properties')
            .select('*')
            .eq('status', 'disponivel')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // XML Header
        let xml = `<?xml version="1.0" encoding="utf-8"?>
<ListingDataFeed xmlns="http://www.viva-real.com/schemas/1.0/VRSync" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.viva-real.com/schemas/1.0/VRSync http://www.vivareal.com.br/schemas/1.0/vrsync.xsd">
    <Header>
        <Provider>KF Imóveis</Provider>
        <Email>contato@kfimoveis.com.br</Email>
        <ContactName>KF Imóveis</ContactName>
        <PublishDate>${new Date().toISOString()}</PublishDate>
    </Header>
    <Listings>`;

        properties?.forEach((prop) => {
            const transactionType = prop.type === 'venda' ? 'For Sale' : 'For Rent';
            const price = prop.price || 0;
            const propertyType = mapPropertyType(prop.subtype || 'Apartamento');

            xml += `
        <Listing>
            <ListingID>${prop.id}</ListingID>
            <Title><![CDATA[${prop.title || 'Imóvel em Praia Grande'}]]></Title>
            <TransactionType>${transactionType}</TransactionType>
            <DetailViewUrl>https://kfimoveis.com.br/imovel/${prop.id}</DetailViewUrl>
            <Media>`;
            
            prop.images?.forEach((img: string) => {
                xml += `
                <Item type="image" caption="${prop.title || 'Imagem do imóvel'}">${img}</Item>`;
            });

            xml += `
            </Media>
            <Details>
                <PropertyType>${propertyType}</PropertyType>
                <Description><![CDATA[${prop.description || ''}]]></Description>
                <ListPrice currency="BRL">${price}</ListPrice>
                <LivingArea unit="square meters">${prop.area || 0}</LivingArea>
                <TotalArea unit="square meters">${prop.area_total || prop.area || 0}</TotalArea>
                <Bedrooms>${prop.rooms || 0}</Bedrooms>
                <Bathrooms>${prop.bathrooms || 0}</Bathrooms>
                <Suites>${prop.suites || 0}</Suites>
                <Garage>${prop.parking_spaces || 0}</Garage>
                <Features>`;
            
            prop.features?.forEach((feat: string) => {
                xml += `
                    <Feature>${feat}</Feature>`;
            });

            xml += `
                </Features>
            </Details>
            <Location>
                <Country abbreviation="BR">Brasil</Country>
                <State abbreviation="${prop.state || 'SP'}">${prop.state === 'SP' ? 'São Paulo' : prop.state}</State>
                <City>${prop.city || 'Praia Grande'}</City>
                <Neighborhood>${prop.neighborhood || ''}</Neighborhood>
                <Address>${prop.address || ''}</Address>
                <Number>${prop.address_number || ''}</Number>
                <PostalCode>${prop.cep || ''}</PostalCode>
            </Location>
            <ContactInfo>
                <Email>contato@kfimoveis.com.br</Email>
                <Name>KF Imóveis</Name>
            </ContactInfo>
        </Listing>`;
        });

        xml += `
    </Listings>
</ListingDataFeed>`;

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 's-maxage=3600, stale-while-revalidate',
            },
        });
    } catch (error) {
        console.error('Error generating XML feed:', error);
        return new NextResponse('Error generating feed', { status: 500 });
    }
}

function mapPropertyType(subtype: string): string {
    const s = subtype.toLowerCase();
    if (s.includes('apartamento')) return 'Residential / Apartment';
    if (s.includes('casa')) return 'Residential / Home';
    if (s.includes('sobrado')) return 'Residential / Home';
    if (s.includes('kitnet')) return 'Residential / Kitchenette';
    if (s.includes('terreno')) return 'Residential / Land Lot';
    if (s.includes('comercial')) return 'Commercial / Office';
    return 'Residential / Apartment';
}
