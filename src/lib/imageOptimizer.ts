/**
 * Utilitário de compressão e otimização automática de imagens no cliente (navegador).
 * Reduz resolução e comprime em formato WebP antes do envio ao Supabase Storage,
 * economizando até 90% do espaço em disco e tráfego (egress).
 */

export interface OptimizeImageOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0.1 a 1.0
    watermarkUrl?: string | null;
    watermarkOpacity?: number;
    watermarkScale?: number; // Fração da largura da foto (ex: 0.35 = 35%)
}

export interface OptimizedImageResult {
    blob: Blob;
    extension: 'webp' | 'jpg';
    mimeType: 'image/webp' | 'image/jpeg';
    width: number;
    height: number;
}

/**
 * Otimiza e opcionalmente adiciona marca d'água em uma imagem de forma 100% automática.
 */
export async function optimizeImage(
    file: File | Blob,
    options: OptimizeImageOptions = {}
): Promise<OptimizedImageResult> {
    const {
        maxWidth = 1600,
        maxHeight = 1600,
        quality = 0.8,
        watermarkUrl = null,
        watermarkOpacity = 0.4,
        watermarkScale = 0.35,
    } = options;

    return new Promise((resolve, reject) => {
        const imgUrl = URL.createObjectURL(file);
        const img = new Image();

        img.onload = async () => {
            try {
                URL.revokeObjectURL(imgUrl);

                let targetWidth = img.naturalWidth || img.width;
                let targetHeight = img.naturalHeight || img.height;

                // Redimensionamento proporcional se exceder os limites
                if (targetWidth > maxWidth || targetHeight > maxHeight) {
                    const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
                    targetWidth = Math.round(targetWidth * ratio);
                    targetHeight = Math.round(targetHeight * ratio);
                }

                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d', { alpha: false });

                if (!ctx) {
                    reject(new Error('Falha ao obter contexto 2D do Canvas'));
                    return;
                }

                // Fundo branco caso haja transparência em JPG/WebP
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, targetWidth, targetHeight);

                // Desenha a imagem principal redimensionada
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                // Aplica marca d'água se informada
                if (watermarkUrl) {
                    try {
                        const wmImg = await loadWatermark(watermarkUrl);
                        if (wmImg && wmImg.width > 0 && wmImg.height > 0) {
                            const wmWidth = targetWidth * watermarkScale;
                            const wmHeight = (wmImg.height / wmImg.width) * wmWidth;
                            const wmX = (targetWidth - wmWidth) / 2;
                            const wmY = (targetHeight - wmHeight) / 2;

                            ctx.save();
                            ctx.globalAlpha = watermarkOpacity;
                            ctx.drawImage(wmImg, wmX, wmY, wmWidth, wmHeight);
                            ctx.restore();
                        }
                    } catch (wmErr) {
                        // Se falhar ao carregar a marca d'água, segue sem travar o upload
                        console.warn('Não foi possível carregar a marca dágua, seguindo sem ela:', wmErr);
                    }
                }

                // Tenta exportar em WebP, que comprime até 40% melhor que JPEG
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve({
                                blob,
                                extension: 'webp',
                                mimeType: 'image/webp',
                                width: targetWidth,
                                height: targetHeight,
                            });
                        } else {
                            // Fallback caso o navegador não suporte toBlob em webp
                            canvas.toBlob(
                                (fallbackBlob) => {
                                    if (fallbackBlob) {
                                        resolve({
                                            blob: fallbackBlob,
                                            extension: 'jpg',
                                            mimeType: 'image/jpeg',
                                            width: targetWidth,
                                            height: targetHeight,
                                        });
                                    } else {
                                        reject(new Error('Falha na conversão da imagem pelo Canvas'));
                                    }
                                },
                                'image/jpeg',
                                quality
                            );
                        }
                    },
                    'image/webp',
                    quality
                );
            } catch (err) {
                reject(err);
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(imgUrl);
            reject(new Error('Falha ao carregar a imagem para processamento'));
        };

        img.src = imgUrl;
    });
}

// Cache da marca d'água em memória para não baixar várias vezes no mesmo lote de fotos
let cachedWatermark: { url: string; img: HTMLImageElement } | null = null;

function loadWatermark(url: string): Promise<HTMLImageElement | null> {
    if (cachedWatermark && cachedWatermark.url === url) {
        return Promise.resolve(cachedWatermark.img);
    }

    return new Promise((resolve) => {
        const wm = new Image();
        wm.crossOrigin = 'anonymous';
        wm.onload = () => {
            cachedWatermark = { url, img: wm };
            resolve(wm);
        };
        wm.onerror = () => {
            resolve(null);
        };
        wm.src = url;
    });
}
