import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// 1. Carrega variáveis de ambiente de .env.local
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        content.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                const [key, ...values] = trimmed.split('=');
                process.env[key.trim()] = values.join('=').trim();
            }
        });
    }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BUCKET = 'properties';

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas em .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false }
});

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function run() {
    console.log('🚀 Iniciando análise e otimização das imagens no Supabase Storage...');
    console.log(`📡 URL: ${SUPABASE_URL}`);
    console.log(`📦 Bucket: ${BUCKET}\n`);

    // Busca todos os imóveis com imagens
    const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('id, title, images');

    if (propError) {
        console.error('❌ Erro ao buscar imóveis:', propError.message);
        return;
    }

    console.log(`📋 Encontrados ${properties.length} imóveis cadastrados.`);

    let totalImagesScanned = 0;
    let totalImagesOptimized = 0;
    let totalBytesOriginal = 0;
    let totalBytesCompressed = 0;

    for (const prop of properties) {
        if (!prop.images || !Array.isArray(prop.images) || prop.images.length === 0) {
            continue;
        }

        let updatedImages = [...prop.images];
        let hasChanges = false;

        console.log(`\n🏡 Imóvel: "${prop.title || prop.id}" (${prop.images.length} fotos)`);

        for (let i = 0; i < prop.images.length; i++) {
            const imgUrl = prop.images[i];
            totalImagesScanned++;

            // Verifica se a imagem pertence ao nosso bucket do Supabase
            if (!imgUrl.includes(`/${BUCKET}/`)) {
                console.log(`  ⏩ [${i + 1}/${prop.images.length}] Imagem externa ou de outro bucket, pulando.`);
                continue;
            }

            try {
                // Baixa a imagem
                const res = await fetch(imgUrl);
                if (!res.ok) {
                    console.log(`  ⚠️ [${i + 1}/${prop.images.length}] Falha ao baixar imagem: HTTP ${res.status}`);
                    continue;
                }

                const arrayBuffer = await res.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const originalSize = buffer.length;

                // Extrai o caminho relativo dentro do bucket
                // Exemplo: https://.../storage/v1/object/public/properties/properties/prop_123.jpg -> properties/prop_123.jpg
                const bucketIndex = imgUrl.indexOf(`/${BUCKET}/`);
                const rawPath = imgUrl.substring(bucketIndex + `/${BUCKET}/`.length);
                const storagePath = decodeURIComponent(rawPath.split('?')[0]);

                // Se já for WebP e menor que 200KB, já está otimizada
                const isWebP = storagePath.toLowerCase().endsWith('.webp');
                if (isWebP && originalSize < 200 * 1024) {
                    console.log(`  ✅ [${i + 1}/${prop.images.length}] Já otimizada (${formatBytes(originalSize)})`);
                    continue;
                }

                // Otimiza com sharp: max 1600x1600 e converte para WebP (qualidade 80)
                const optimizedBuffer = await sharp(buffer)
                    .resize({
                        width: 1600,
                        height: 1600,
                        fit: 'inside',
                        withoutEnlargement: true,
                    })
                    .webp({ quality: 80 })
                    .toBuffer();

                const compressedSize = optimizedBuffer.length;

                // Só substitui se realmente economizou espaço
                if (compressedSize < originalSize) {
                    const savedBytes = originalSize - compressedSize;
                    const percentSaved = Math.round((savedBytes / originalSize) * 100);

                    // Novo nome de arquivo WebP
                    const dirName = path.dirname(storagePath) === '.' ? 'properties' : path.dirname(storagePath);
                    const baseName = path.basename(storagePath, path.extname(storagePath));
                    const newPath = `${dirName}/opt_${Date.now()}_${baseName}.webp`;

                    // Envia imagem otimizada para o Supabase
                    const { error: uploadError } = await supabase.storage
                        .from(BUCKET)
                        .upload(newPath, optimizedBuffer, {
                            contentType: 'image/webp',
                            cacheControl: '31536000',
                            upsert: true,
                        });

                    if (uploadError) {
                        console.error(`  ❌ Erro ao enviar imagem otimizada:`, uploadError.message);
                        continue;
                    }

                    // Pega nova URL pública
                    const { data: publicData } = supabase.storage
                        .from(BUCKET)
                        .getPublicUrl(newPath);

                    updatedImages[i] = publicData.publicUrl;
                    hasChanges = true;

                    // Remove a imagem antiga pesada do storage para liberar espaço
                    const { error: deleteError } = await supabase.storage
                        .from(BUCKET)
                        .remove([storagePath]);

                    if (deleteError) {
                        console.warn(`  ⚠️ Não foi possível apagar arquivo antigo ${storagePath}:`, deleteError.message);
                    }

                    totalImagesOptimized++;
                    totalBytesOriginal += originalSize;
                    totalBytesCompressed += compressedSize;

                    console.log(`  🎉 [${i + 1}/${prop.images.length}] Otimizada: ${formatBytes(originalSize)} ➔ ${formatBytes(compressedSize)} (-${percentSaved}%)`);
                } else {
                    console.log(`  ℹ️ [${i + 1}/${prop.images.length}] Imagem já com tamanho reduzido (${formatBytes(originalSize)})`);
                }
            } catch (imgErr) {
                console.error(`  ❌ Erro processando imagem [${i + 1}]:`, imgErr.message);
            }
        }

        // Se atualizou alguma foto, salva as novas URLs no banco de dados
        if (hasChanges) {
            const { error: updatePropError } = await supabase
                .from('properties')
                .update({ images: updatedImages })
                .eq('id', prop.id);

            if (updatePropError) {
                console.error(`❌ Erro ao atualizar URLs no imóvel ${prop.id}:`, updatePropError.message);
            } else {
                console.log(`💾 URLs do imóvel atualizadas no banco de dados com sucesso!`);
            }
        }
    }

    console.log('\n=============================================');
    console.log('🏁 RESULTADO DA OTIMIZAÇÃO');
    console.log('=============================================');
    console.log(`📸 Total de fotos analisadas: ${totalImagesScanned}`);
    console.log(`✨ Total de fotos otimizadas: ${totalImagesOptimized}`);
    if (totalImagesOptimized > 0) {
        const totalSaved = totalBytesOriginal - totalBytesCompressed;
        const totalPercent = Math.round((totalSaved / totalBytesOriginal) * 100);
        console.log(`📦 Tamanho anterior: ${formatBytes(totalBytesOriginal)}`);
        console.log(`⚡ Novo tamanho:     ${formatBytes(totalBytesCompressed)}`);
        console.log(`💰 Espaço economizado no Supabase: ${formatBytes(totalSaved)} (-${totalPercent}%)`);
    } else {
        console.log('👍 Nenhuma foto pesada precisou ser otimizada.');
    }
}

run().catch(err => {
    console.error('Erro fatal:', err);
});
