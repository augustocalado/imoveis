import { NextRequest, NextResponse } from 'next/server';
import { uploadBufferToR2 } from '@/lib/r2';
import sharp from 'sharp';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const folder = (formData.get('folder') as string) || 'properties';
        const files = formData.getAll('file') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
        }

        const uploadedUrls: string[] = [];

        for (const file of files) {
            if (!(file instanceof File)) continue;

            const arrayBuffer = await file.arrayBuffer();
            const inputBuffer = Buffer.from(arrayBuffer);

            // Se for imagem, otimiza para WebP
            let finalBuffer = inputBuffer;
            let contentType = file.type || 'image/jpeg';
            let extension = 'webp';

            if (file.type?.startsWith('image/') || /\.(jpe?g|png|webp|avif)$/i.test(file.name)) {
                try {
                    finalBuffer = await sharp(inputBuffer)
                        .rotate() // Preserva orientacao EXIF
                        .webp({ quality: 80, effort: 4 })
                        .toBuffer();
                    contentType = 'image/webp';
                    extension = 'webp';
                } catch (sharpError) {
                    console.warn('Erro ao otimizar com Sharp, enviando original:', sharpError);
                    extension = file.name.split('.').pop() || 'jpg';
                }
            } else {
                extension = file.name.split('.').pop() || 'bin';
            }

            const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;
            const key = `${folder}/${uniqueName}`;

            const publicUrl = await uploadBufferToR2(finalBuffer, key, contentType);
            uploadedUrls.push(publicUrl);
        }

        return NextResponse.json({
            success: true,
            url: uploadedUrls[0],
            urls: uploadedUrls
        });
    } catch (error: any) {
        console.error('Erro no upload para Cloudflare R2:', error);
        return NextResponse.json(
            { error: 'Falha no upload para o Cloudflare R2: ' + (error.message || 'Erro desconhecido') },
            { status: 500 }
        );
    }
}
