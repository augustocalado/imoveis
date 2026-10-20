import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

console.log('--- Testando Conexão com Cloudflare R2 ---');
console.log('Account ID:', R2_ACCOUNT_ID);
console.log('Bucket:', R2_BUCKET_NAME);
console.log('Public URL:', R2_PUBLIC_URL);

const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

async function testUpload() {
    try {
        const testContent = Buffer.from('Cloudflare R2 Funcionando Perfeitamente!');
        const testKey = 'test/teste-conexao.txt';

        await s3.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: testKey,
            Body: testContent,
            ContentType: 'text/plain',
        }));

        console.log('✅ Upload com sucesso no Cloudflare R2!');
        console.log(`URL do arquivo de teste: ${R2_PUBLIC_URL}/${testKey}`);
    } catch (err) {
        console.error('❌ Erro ao enviar para o R2:', err);
    }
}

testUpload();
