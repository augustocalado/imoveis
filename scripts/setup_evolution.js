const axios = require('axios');

const API_URL = 'http://localhost:8080';
const API_KEY = 'antigravity_secret_key_123';
const INSTANCE_NAME = 'marcela_ia';
const WEBHOOK_URL = 'http://host.docker.internal:3000/api/webhooks/whatsapp';

async function setup() {
    console.log('--- Iniciando Configuração Automática da Evolution API ---');

    try {
        // 1. Esperar API carregar
        console.log('Aguardando API ficar online...');
        let ready = false;
        for (let i = 0; i < 15; i++) {
            try {
                await axios.get(`${API_URL}/instance/fetchInstances`, { headers: { apikey: API_KEY } });
                ready = true;
                break;
            } catch (e) {
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        if (!ready) throw new Error('API não respondeu a tempo.');

        // 2. Criar Instância
        console.log(`Verificando/Criando instância "${INSTANCE_NAME}"...`);
        try {
            await axios.post(`${API_URL}/instance/create`, {
                instanceName: INSTANCE_NAME,
                token: API_KEY,
                qrcode: true,
                integration: 'WHATSAPP-BAILEYS'
            }, { headers: { apikey: API_KEY } });
            console.log('Instância criada com sucesso!');
        } catch (e) {
            const msg = e.response?.data?.message || '';
            const errorMsg = Array.isArray(msg) ? msg[0] : msg;
            
            if (errorMsg.includes('already in use') || errorMsg.includes('already exists')) {
                console.log('✅ Instância já existe, seguindo para configuração do Webhook...');
            } else {
                console.error('❌ Erro inesperado ao criar instância:', e.response?.data || e.message);
                // Não jogamos o erro para tentar configurar o webhook mesmo assim
            }
        }

        // 3. Configurar Webhook
        console.log('Configurando Webhook...');
        try {
            // Na v2 o endpoint mudou para /webhook/set/:instance
            await axios.post(`${API_URL}/webhook/set/${INSTANCE_NAME}`, {
                webhook: {
                    enabled: true,
                    url: WEBHOOK_URL,
                    byEvents: false,
                    base64: false,
                    events: [
                        'MESSAGES_UPSERT',
                        'MESSAGES_UPDATE',
                        'MESSAGES_SET'
                    ]
                }
            }, { headers: { apikey: API_KEY } });
            console.log('✅ Webhook configurado com sucesso!');
        } catch (e) {
            console.error('❌ Falha ao configurar Webhook:', e.response?.data || e.message);
        }

        // 4. Buscar link do QR Code / Conexão
        console.log('\n--- Link de Conexão ---');
        console.log(`🔗 Link para o QR Code: ${API_URL}/instance/connect/${INSTANCE_NAME}`);
        console.log('\n✅ Script finalizado! Se o link acima não abrir, certifique-se que o Docker está rodando.');

    } catch (error) {
        console.error('❌ Erro fatal:', error.message);
    }
}

setup();
