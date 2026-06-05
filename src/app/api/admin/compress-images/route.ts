import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import sharp from 'sharp';

export async function POST() {
    try {
        const { data: files, error: listError } = await supabaseAdmin
            .storage
            .from('properties')
            .list('properties', { limit: 1000 });

        if (listError) {
            return NextResponse.json({ error: 'Erro ao listar arquivos: ' + listError.message }, { status: 500 });
        }

        if (!files || files.length === 0) {
            return NextResponse.json({ message: 'Nenhuma imagem encontrada para comprimir.' });
        }

        const results: { file: string; before: number; after: number; saved: number }[] = [];
        let totalSaved = 0;

        for (const file of files) {
            if (file.metadata?.mimetype && !file.metadata.mimetype.startsWith('image/')) continue;

            const filePath = `properties/${file.name}`;

            const { data: blob, error: downloadError } = await supabaseAdmin
                .storage
                .from('properties')
                .download(filePath);

            if (downloadError || !blob) {
                results.push({ file: file.name, before: 0, after: 0, saved: 0 });
                continue;
            }

            const buffer = Buffer.from(await blob.arrayBuffer());
            const beforeSize = buffer.length;

            const compressed = await sharp(buffer)
                .rotate()
                .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();

            const afterSize = compressed.length;

            if (afterSize >= beforeSize) {
                results.push({ file: file.name, before: beforeSize, after: afterSize, saved: 0 });
                continue;
            }

            const { error: uploadError } = await supabaseAdmin
                .storage
                .from('properties')
                .update(filePath, compressed, {
                    contentType: 'image/webp',
                    upsert: true,
                });

            if (uploadError) {
                results.push({ file: file.name, before: beforeSize, after: afterSize, saved: 0 });
                continue;
            }

            const saved = beforeSize - afterSize;
            totalSaved += saved;
            results.push({ file: file.name, before: beforeSize, after: afterSize, saved });
        }

        return NextResponse.json({
            message: 'Compressão concluída.',
            totalSaved,
            totalSavedFormatted: formatBytes(totalSaved),
            files: results.map(r => ({
                ...r,
                beforeFormatted: formatBytes(r.before),
                afterFormatted: formatBytes(r.after),
                savedFormatted: formatBytes(r.saved),
            })),
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
