import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME } from '@/lib/r2';

export const runtime = 'nodejs';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fuoipsehqjnpafhqjnyo.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function getSupabaseStats() {
    try {
        const buckets = ['properties', 'avatars', 'partners'];
        let totalFiles = 0;
        let totalSize = 0;
        const details: Record<string, { files: number; size: number }> = {};

        for (const bucket of buckets) {
            try {
                const { data, error } = await supabaseAdmin.storage
                    .from(bucket)
                    .list('', { limit: 1000, offset: 0 });

                if (error || !data) {
                    details[bucket] = { files: 0, size: 0 };
                    continue;
                }

                // Lista recursiva de subpastas
                const allFiles: any[] = [];
                const recurse = async (prefix: string) => {
                    const { data: items } = await supabaseAdmin.storage
                        .from(bucket)
                        .list(prefix, { limit: 1000 });
                    if (!items) return;
                    for (const item of items) {
                        if (item.id) {
                            allFiles.push(item);
                        } else {
                            await recurse(prefix ? `${prefix}/${item.name}` : item.name);
                        }
                    }
                };

                for (const item of data) {
                    if (item.id) {
                        allFiles.push(item);
                    } else {
                        await recurse(item.name);
                    }
                }

                const bucketSize = allFiles.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);
                details[bucket] = { files: allFiles.length, size: bucketSize };
                totalFiles += allFiles.length;
                totalSize += bucketSize;
            } catch {
                details[bucket] = { files: 0, size: 0 };
            }
        }

        return { totalFiles, totalSize, details, error: null };
    } catch (err: any) {
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
                const folder = (obj.Key || '').split('/')[0] || 'root';
                if (!folderBreakdown[folder]) folderBreakdown[folder] = { files: 0, size: 0 };
                folderBreakdown[folder].files++;
                folderBreakdown[folder].size += obj.Size || 0;
            }

            continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
        } while (continuationToken);

        return { totalFiles, totalSize, folderBreakdown, error: null };
    } catch (err: any) {
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

export async function GET() {
    const [supabase, r2] = await Promise.all([getSupabaseStats(), getR2Stats()]);

    // Limites gratuitos
    const SUPABASE_FREE_LIMIT = 1 * 1024 * 1024 * 1024; // 1 GB
    const R2_FREE_LIMIT = 10 * 1024 * 1024 * 1024; // 10 GB

    return NextResponse.json({
        supabase: {
            totalFiles: supabase.totalFiles,
            totalSize: supabase.totalSize,
            totalSizeFormatted: formatBytes(supabase.totalSize),
            usagePercent: Math.min(100, Math.round((supabase.totalSize / SUPABASE_FREE_LIMIT) * 100)),
            freeLimit: SUPABASE_FREE_LIMIT,
            freeLimitFormatted: '1 GB',
            details: supabase.details,
            error: supabase.error,
        },
        r2: {
            totalFiles: r2.totalFiles,
            totalSize: r2.totalSize,
            totalSizeFormatted: formatBytes(r2.totalSize),
            usagePercent: Math.min(100, Math.round((r2.totalSize / R2_FREE_LIMIT) * 100)),
            freeLimit: R2_FREE_LIMIT,
            freeLimitFormatted: '10 GB',
            folderBreakdown: r2.folderBreakdown,
            error: r2.error,
        },
    });
}
