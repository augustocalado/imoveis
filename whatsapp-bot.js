const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' }); // Lê do seu .env.local

// 1. Configurar Supabase e Chave da IA
// Usando as variáveis que você já tem no .env.local para não quebrar o site
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// O OpenRouter já roda com fetch nativo
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// 2. FUNÇÃO: IA com FALLBACK AUTOMÁTICO
async function getAIResponse(userMessage, name, history) {
    // 2.1 Buscar DB: Imóveis
    // Limitar a trazer imóveis disponíveis, os campos mais úteis (titulo, preco, localizacao, quartos se tiver)
    let inventoryString = 'Nenhum imóvel listado no banco no momento.';
    try {
        const { data: props, error: propsError } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100); // Traz banco muito maior para garantir que ela ache a Referência
            
        if (propsError) throw new Error(propsError.message);
            
        if (props && props.length > 0) {
            inventoryString = props.map(p => {
                const tipo = p.category || p.property_type || p.type || 'Imóvel';
                const local = p.neighborhood || p.city || p.location || 'Bairro a consultar';
                const preco = p.price ? `R$${p.price}` : 'Sob Consulta';
                const detalhes = p.bedrooms ? ` | Quartos: ${p.bedrooms}` : '';
                const desc = p.description ? ` | Desc: ${p.description.substring(0,120).replace(/\n/g, ' ')}...` : '';
                const urlCode = p.slug || p.id;
                return `- Ref ${p.id.substring(0,6).toUpperCase()}: [${tipo}] ${p.title} em ${local}. Preço: ${preco}${detalhes}${desc}. Link: https://katiaeflavioimoveis.com.br/imovel/${urlCode}`;
            }).join('\n    ');
        }
    } catch (e) {
        console.error("Erro puxando imóveis.", e.message);
    }

    // 2.2 Buscar DB: Agendamentos ocupados (dos próximos 30 dias)
    let occupiedSlots = 'Nenhum horário ocupado no momento. Pode sugerir qualquer um comercial.';
    try {
        const today = new Date().toISOString();
        const { data: apps, error: appsError } = await supabase
            .from('appointments')
            .select('scheduled_at')
            .gte('scheduled_at', today)
            .order('scheduled_at', { ascending: true })
            .limit(20);
            
        if (!appsError && apps && apps.length > 0) {
            occupiedSlots = apps.map(a => `- HORÁRIO JÁ OCUPADO: ${new Date(a.scheduled_at).toLocaleString('pt-BR')}`).join('\n    ');
        }
    } catch(e) {
        console.error("Erro puxando agendamentos.", e.message);
    }

    const systemPrompt = `
    IDENTIFICAÇÃO DO CLIENTE:
    - O nome do cliente é: ${name}.
    
    Você é Catarina, assistente virtual de uma imobiliária especializada em VENDA de imóveis.

    INVENTÁRIO ATUAL EXATO DO BANCO DE DADOS (Baseie-se ÚNICA E EXCLUSIVAMENTE nesta lista para vender):
    ${inventoryString}

    AGENDA DA IMOBILIÁRIA - HORÁRIOS INDISPONÍVEIS (Não sugira esses dias/horas):
    ${occupiedSlots}

    Seu objetivo principal é:
    1. Se o cliente vier com interesse GENÉRICO: Faça perguntas objetivas e faça uma listinha sugerindo ATÉ 5 imóveis que encaixem no que ele pediu, tirados DA LISTA ACIMA. Ofereça visita perguntando: "Que tal agendarmos uma visita? Quais destes você quer conhecer?".
    2. Se o cliente perguntar de uma REFERÊNCIA ESPECÍFICA (Ex: "Tem a Ref 123?"): Foque 100% EXCLUSIVAMENTE nela usando os detalhes do inventário. Responda a dúvida sobre aquele imóvel e NUNCA ofereça outros imóveis adicionais, a não ser que ele não goste mais do atual. Para visita, pergunte: "Que tal agendarmos uma visita neste imóvel?".
    - Se enviar algum imóvel, OBRIGATORIAMENTE DEVE colocar o "Link" que está no inventário.
    - APENAS se o cliente aceitar marcar e propuser dia/hora, cheque a AGENDA DE INDISPONÍVEIS para confirmar.

    CLASSIFICAÇÃO DE LEAD (SECRETO):
    No finalzinho absoluto de TODA mensagem sua, obrigatoriamente coloque a tag de temperatura: [LEAD:QUENTE], [LEAD:MORNO] ou [LEAD:FRIO].
    - FRIO: Apenas curioso ou mensagem rápida inicial.
    - MORNO: Fez perguntas construtivas sobre as casas, tem real interesse.
    - QUENTE: Forte intenção de compra, aceitou marcar visita ou quer fechar negócio.

    Regras importantes:
    - A imobiliária NÃO trabalha com aluguel, apenas venda. Sempre que o cliente mencionar aluguel, informe isso educadamente e redirecione para compra.
    - NUNCA INVENTE IMÓVEIS OU LINKS. Se o cliente pedir algo fora do inventário, diga que no momento temos apenas os listados.
    - Se o cliente responder apenas com "Ok", "Tá bom", "Beleza" ou algo que pareça concordância sem continuar o assunto, simplesmente responda: "Se precisar de algo mais, estaremos à disposição! 😊" e encerre a interação gentilmente.

    Tom de voz: Amigável, profissional e direto. Pode e deve inserir alguns ícones (emojis) na conversa para parecer mais humana, mas sem exagerar. Use no máximo 4 linhas. Evite respostas gigantescas.
    `;
    
    const messages = [{ role: "system", content: systemPrompt }];
    
    if (history) {
        history.forEach(h => messages.push({ role: h.role === "user" ? "user" : "assistant", content: h.message }));
    }
    messages.push({ role: "user", content: userMessage });
    
    // LISTA DE MODELOS (Se um falhar, tenta o próximo)
    const models = [
        "openai/gpt-4o-mini",              // 1ª Opção
        "google/gemini-flash-1.5",         // 2ª Opção de segurança
        "meta-llama/llama-3.1-8b-instruct" // 3ª Opção final
    ];

    for (const model of models) {
        try {
            console.log(`🤖 Tentando modelo: ${model}...`);
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ model: model, messages: messages, temperature: 0.7 })
            });
            if (response.ok) {
                const data = await response.json();
                return data.choices[0].message.content;
            }
        } catch (e) {
            console.error(`⚠️ Erro com ${model}:`, e.message);
        }
    }
    
    return "Tivemos um pequeno pico no servidor! Me mande um 'Oi' novamente!";
}

// 3. Inicializar Cliente WhatsApp Raiz
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_session' }),
    puppeteer: { 
        headless: false, // Abre o navegador de verdade para acompanharmos
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox'
        ],
        timeout: 60000 // 60 seconds
    }
});

client.on('qr', (qr) => {
    // Quando ele pedir conexão, o QR code é desenhado no terminal
    console.log('👇 ESCANEIE O QR CODE ABAIXO: 👇');
    qrcode.generate(qr, { small: true }); 
});

client.on('ready', () => { 
    console.log('✅ Robô está ONLINE e Conectado diretamente (Modo Raiz)!'); 
});

// Pegar o timestamp de quando o robô ligou
const botStartTime = Math.floor(Date.now() / 1000);

// Memória de trava para evitar responder em duplicidade quando mandam 3 msgs ao mesmo tempo
const activeChats = new Set();
const welcomedNumbers = new Set();
const inactivityTimers = new Map(); // Guarda cronômetros de 7 minutos

const humanPausedChats = new Set(); // NOVO: Guarda os chats que o humano assumiu
const lastBotMessage = new Map(); // NOVO: Guarda a última mensagem enviada pela IA

// 4. Lógica de Atendimento ao Receber Mensagem
client.on('message_create', async (msg) => {
    // 1. Evitar grupos e status
    if (msg.from.includes('@g.us') || (msg.to && msg.to.includes('@g.us')) || msg.broadcast || msg.from === 'status@broadcast') return;
    
    // 2. Não responder mensagens antigas 
    if (msg.timestamp < botStartTime) return;
    
    // 3. Verifica se a mensagem foi enviada do próprio número do bot (Atendente ou o próprio Bot)
    if (msg.fromMe) {
        const toPhone = msg.to;
        
        // Comando do humano para despausar manualmente a IA (escrevendo !ativar para o cliente)
        if (msg.body === '!ativar' || msg.body === '/ativar') {
            console.log(`\n🤖 IA reativada manualmente para ${toPhone}`);
            humanPausedChats.delete(toPhone);
            return;
        }

        // Se a mensagem enviada NÃO for a mesma que a IA gerou, ou se enviou uma mídia (IA não envia mídia)
        // Isso significa que o ATENDENTE HUMANO pegou no celular ou no WhatsApp Web e digitou!
        if (lastBotMessage.get(toPhone) !== msg.body || msg.hasMedia) {
            if (!humanPausedChats.has(toPhone) && toPhone !== 'status@broadcast') {
                console.log(`\n👨‍💻 Atendente humano assumiu a conversa com ${toPhone}. Pausando a IA.`);
                humanPausedChats.add(toPhone);
            }
        }
        return; // Mensagens enviadas por nós (bot ou humano) não são processadas como dúvidas do cliente
    }
    
    const phoneNumber = msg.from;

    // Se o humano pausou, a IA ignora tudo que o cliente mandar daqui pra frente
    if (humanPausedChats.has(phoneNumber)) return;
    
    // Bloqueador de Arquivos, Mídias e Links:
    const containsLink = /(http:\/\/|https:\/\/|www\.)/i.test(msg.body);
    if (msg.hasMedia || msg.type === 'document' || msg.type === 'audio' || msg.type === 'ptt' || msg.type === 'image' || containsLink) {
        console.log(`📎 Cliente enviou mídia ou link. Transferindo atendimento...`);
        const chat = await msg.getChat();
        await chat.sendStateTyping();
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const transferMsg = "Vamos transferir para o corretor mais próximo aguarde.";
        lastBotMessage.set(phoneNumber, transferMsg);
        await msg.reply(transferMsg);
        
        // Zera a memória e ignora a mensagem (para o corretor assumir no WhatsApp sem a bot atrapalhar)
        welcomedNumbers.delete(phoneNumber);
        await supabase.from('chat_history').delete().eq('phone_number', phoneNumber);
        
        // Pausa a IA automaticamente já que sugerimos transferência
        humanPausedChats.add(phoneNumber);
        
        return; 
    }
    
    const contact = await msg.getContact();
    const name = contact.pushname || "Visitante";
    
    // --- LÓGICA DE INATIVIDADE (7 MINUTOS) ---
    // Limpa o cronômetro antigo se o cliente mandou nova mensagem antes de acabar o tempo
    if (inactivityTimers.has(phoneNumber)) clearTimeout(inactivityTimers.get(phoneNumber));
    
    // Inicia a nova contagem de 7 minutos (7 * 60 * 1000 = 420000ms)
    const timeoutId = setTimeout(async () => {
        const adeusMsg = "Como ficamos um tempinho sem nos interagir, vou encerrar este atendimento por inatividade para organizar minha agenda. Se precisar de algo, basta mandar um 'Oi' que eu puxo o seu cadastro de volta! Até mais!";
        try {
            lastBotMessage.set(phoneNumber, adeusMsg);
            await client.sendMessage(phoneNumber, adeusMsg);
            welcomedNumbers.delete(phoneNumber); // Reseta a memória de primeira saudação
            humanPausedChats.delete(phoneNumber); // Se mandou mensagem de timeout, o humano saiu, a IA pode voltar a atender no futuro se ele chamar de novo
            await supabase.from('chat_history').delete().eq('phone_number', phoneNumber); // Apaga histórico pra zerar o funil
            console.log(`⏰ Atendimento de ${phoneNumber} encerrado por 7 min de inatividade.`);
        } catch (e) {
            console.error("Erro no encerramento inativo:", e.message);
        }
    }, 7 * 60 * 1000);
    
    inactivityTimers.set(phoneNumber, timeoutId);
    
    try {
        console.log(`\n📩 Mensagem NOVA de ${name}: ${msg.body}`);
        
        // Salva GERAL a mensagem, para a IA ter o histórico caso ele mande pingadinho
        await supabase.from('chat_history').insert([{ phone_number: phoneNumber, message: msg.body, role: 'user' }]);

        // TRAVA ANTI-SPAM: Se já estiver processando alguma resposta pra esse número, a gente apenas gravou no DB e cai fora!
        if (activeChats.has(phoneNumber)) {
            console.log(`⏳ Cliente enviou texto pingado. Já estou gerando resposta pra ele, apenas registrei essa para a próxima.`);
            return;
        }

        activeChats.add(phoneNumber); // 🔒 Tranca o chat
        
        // Traz as conversas
        const { data: historyData } = await supabase.from('chat_history')
             .select('message, role')
             .eq('phone_number', phoneNumber)
             .order('created_at', { ascending: false })
             .limit(8);
             
        const history = historyData ? historyData.reverse() : [];
        const assistantMsgs = history.filter(h => h.role === 'assistant');

        // Verifica se é a PRIMEIRA vez (zero msgs do assistente antes E ainda não está na memória)
        if (assistantMsgs.length === 0 && !welcomedNumbers.has(phoneNumber)) {
            welcomedNumbers.add(phoneNumber);
            console.log(`🆕 Novo cliente. Enviando Boas Vindas com delay simulado...`);
            
            const welcomeMsg = "Olá! Sou Catarina. Para dar continuidade ao seu atendimento, me diga seu nome e o que está procurando.";
            
            const chat = await msg.getChat();
            await chat.sendStateTyping();
            
            // Pausa de 3 a 5 segs
            await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 2000) + 3000));
            
            lastBotMessage.set(phoneNumber, welcomeMsg);
            await msg.reply(welcomeMsg);
            await supabase.from('chat_history').insert([{ phone_number: phoneNumber, message: welcomeMsg, role: 'assistant' }]);
            
            activeChats.delete(phoneNumber); // 🔓 Destranca
            return; 
        }

        // --- FLUXO DA INTELIGÊNCIA ARTIFICIAL ---
        const chat = await msg.getChat();
        await chat.sendStateTyping();
        
        let aiResponse = await getAIResponse(msg.body, name, history);
        
        // Extrai a classe de Lead invisível da IA
        let leadScore = 'Frio';
        const scoreMatch = aiResponse.match(/\[LEAD:(QUENTE|MORNO|FRIO)\]/i);
        if (scoreMatch) {
            let pureScore = scoreMatch[1].toUpperCase();
            leadScore = pureScore === 'QUENTE' ? '🔥 Quente' : pureScore === 'MORNO' ? '🟡 Morno' : '❄️ Frio';
            // Apaga para não aparecer no zap do cliente
            aiResponse = aiResponse.replace(/\[LEAD:(QUENTE|MORNO|FRIO)\]/ig, '').trim();
        }

        // Timer pra ficar mais natural após o tempo longo da API
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 2000) + 2000));
        
        lastBotMessage.set(phoneNumber, aiResponse);
        await msg.reply(aiResponse);
        await supabase.from('chat_history').insert([{ phone_number: phoneNumber, message: aiResponse, role: 'assistant' }]);
        
        // Salva silenciosamente no CRM da imobiliária
        const { data: existingLeads } = await supabase.from('chat_leads').select('id').eq('phone', phoneNumber).limit(1);
        if (existingLeads && existingLeads.length > 0) {
            await supabase.from('chat_leads').update({ score: leadScore, name: name, updated_at: new Date().toISOString() }).eq('id', existingLeads[0].id);
        } else {
            await supabase.from('chat_leads').insert([{ phone: phoneNumber, name: name, score: leadScore, status: 'Novo', interest: 'Veio pelo WhatsApp Automatizado' }]);
        }
        
        console.log(`✅ Resposta IA enviada ao cliente! (Score Atualizado: ${leadScore})`);
        
    } catch (error) { 
        console.error('❌ Erro:', error); 
    } finally {
        activeChats.delete(phoneNumber); // 🔓 Garante que será destrancado caso caia erro
    }
});

console.log('⏳ Iniciando o Motor Raiz do WhatsApp (Aguarde alguns segundos)...');
client.initialize();
