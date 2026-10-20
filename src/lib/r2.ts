import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || 'f0a51617cf3240176ab2203473647714';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '49de3f89ceab00c5583076b5102c79f8';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '81719d2409ba703ccde31f521d7ad8073f9fa680806bb5afbc441fcb1faa0a28';
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'imoveis-storage';
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-542b228b1ebb449cacc05a8382e11115.r2.dev';

export const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

export async function uploadBufferToR2(
    buffer: Buffer | Uint8Array,
    key: string,
    contentType: string = 'image/webp'
): Promise<string> {
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;

    await r2Client.send(
        new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: cleanKey,
            Body: buffer,
            ContentType: contentType,
        })
    );

    const baseUrl = R2_PUBLIC_URL.endsWith('/') ? R2_PUBLIC_URL.slice(0, -1) : R2_PUBLIC_URL;
    return `${baseUrl}/${cleanKey}`;
}

export async function deleteObjectFromR2(key: string): Promise<void> {
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;
    await r2Client.send(
        new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: cleanKey,
        })
    );
}
