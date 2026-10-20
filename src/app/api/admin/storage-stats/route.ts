import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME } from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fuoipsehqjnpafhqjnyo.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Cache em memória (3 minutos) para evitar requisições pesadas a cada render
let cachedStats: any = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 3 * 60 * 1000;

async function getSupabaseStats() {
    try {
        let totalFiles = 0;
        let totalSize = 0;
        const details: Record<string, { files: number; size: number }> = {};

        // Lista a raiz do bucket principal 'properties'
        const { data: rootItems, error: rootError } = await supabaseAdmin.storage
            .from('properties')
            .list('', { limit: 100 });

        if (rootError) {
            console.error('Erro ao listar raiz Supabase:', rootError);
            return { totalFiles: 0, totalSize: 0, details: {}, error: rootError.message };
        }

        for (const item of (rootItems || [])) {
            if (item.id) {
                // Arquivo na raiz
                totalFiles++;
                const size = item.metadata?.size || 0;
                totalSize += size;
                if (!details['raiz']) details['raiz'] = { files: 0, size: 0 };
                details['raiz'].files++;
                details['raiz'].size += size;
            } else {
                // Pasta (ex: 'properties', 'avatars', 'partners', 'assets')
                const folderName = item.name;
                let folderFiles = 0;
                let folderSize = 0;
                let offset = 0;
                const limit = 1000;

                // Paginação completa de 1000 em 1000 para não perder nenhum arquivo
                while (true) {
                    const { data: batch, error: batchError } = await supabaseAdmin.storage
                        .from('properties')
                        .list(folderName, {
                            limit,
                            offset,
                            sortBy: { column: 'name', order: 'asc' }
                        });

                    if (batchError || !batch || batch.length === 0) break;

                    for (const file of batch) {
                        if (file.id) {
                            folderFiles++;
                            folderSize += file.metadata?.size || 0;
                        }
                    }

                    if (batch.length < limit) break;
                    offset += limit;
                }

                totalFiles += folderFiles;
                totalSize += folderSize;
                details[folderName] = { files: folderFiles, size: folderSize };
            }
        }

        return { totalFiles, totalSize, details, error: null };
    } catch (err: any) {
        console.error('Erro getSupabaseStats:', err);
        return { totalFiles: 0, totalSize: 0, details: {}, error: err.message };
    }
}

async function getR2Stats() {
    try {
        let totalFiles = 0;
        let totalSize = 0;
        let continuationToken: string | undefined;
        const folderBreakdown: Record<string, { files: number; size: number }> = {};

        do {
            const cmd = new ListObjectsV2Command({
                Bucket: R2_BUCKET_NAME,
                MaxKeys: 1000,
                ContinuationToken: continuationToken,
            });

            const res = await r2Client.send(cmd);
            const contents = res.Contents || [];

            for (const obj of contents) {
                totalFiles++;
                totalSize += obj.Size || 0;

                // Breakdown por pasta (ex: "properties/", "avatars/")
                const folder = (obj.Key || '').split('/')[0] || 'raiz';
                if (!folderBreakdown[folder]) folderBreakdown[folder] = { files: 0, size: 0 };
                folderBreakdown[folder].files++;
                folderBreakdown[folder].size += obj.Size || 0;
            }

            continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
        } while (continuationToken);

        return { totalFiles, totalSize, folderBreakdown, error: null };
    } catch (err: any) {
        console.error('Erro getR2Stats:', err);
        return { totalFiles: 0, totalSize: 0, folderBreakdown: {}, error: err.message };
    }
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const forceFresh = url.searchParams.get('fresh') === 'true';

    const now = Date.now();
    if (!forceFresh && cachedStats && now - lastCacheTime < CACHE_TTL_MS) {
        return NextResponse.json({ ...cachedStats, fromCache: true });
    }

    const [supabase, r2] = await Promise.all([getSupabaseStats(), getR2Stats()]);

    // Limites gratuitos reais
    const SUPABASE_FREE_LIMIT = 1 * 1024 * 1024 * 1024; // 1 GB (1.073.741.824 bytes)
    const R2_FREE_LIMIT = 10 * 1024 * 1024 * 1024; // 10 GB

    // Porcentagem real sem trava de 100% (para o usuário ver se ultrapassou)
    const supabasePercent = Math.round((supabase.totalSize / SUPABASE_FREE_LIMIT) * 100);
    const r2Percent = Math.round((r2.totalSize / R2_FREE_LIMIT) * 100);

    const result = {
        supabase: {
            totalFiles: supabase.totalFiles,
            totalSize: supabase.totalSize,
            totalSizeFormatted: formatBytes(supabase.totalSize),
            usagePercent: supabasePercent,
            freeLimit: SUPABASE_FREE_LIMIT,
            freeLimitFormatted: '1 GB',
            details: supabase.details,
            error: supabase.error,
        },
        r2: {
            totalFiles: r2.totalFiles,
            totalSize: r2.totalSize,
            totalSizeFormatted: formatBytes(r2.totalSize),
            usagePercent: r2Percent,
            freeLimit: R2_FREE_LIMIT,
            freeLimitFormatted: '10 GB',
            folderBreakdown: r2.folderBreakdown,
            error: r2.error,
        },
        timestamp: new Date().toISOString(),
        fromCache: false
    };

    cachedStats = result;
    lastCacheTime = now;

    return NextResponse.json(result);
}
