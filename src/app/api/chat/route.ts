import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function getInventory() {
    try {
        const { data: props, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
            
        if (error) {
            console.error("Supabase error (Inventory):", error);
            throw error;
        }
            
        if (props && props.length > 0) {
            return props.map(p => {
                const tipo = p.category || p.property_type || p.type || 'Imóvel';
                const local = p.neighborhood || p.city || p.location || 'Bairro a consultar';
                
                let preco = 'Sob Consulta';
                if (p.price) {
                    try {
                        const val = typeof p.price === 'string' ? parseFloat(p.price.replace(/[^\d.]/g, '')) : p.price;
                        if (!isNaN(val)) {
                            preco = val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                        } else {
                            preco = `R$ ${p.price}`;
                        }
                    } catch (err) {
                        preco = `R$ ${p.price}`;
                    }
                }

                const detalhes = p.bedrooms ? ` | Quartos: ${p.bedrooms}` : '';
                const desc = p.description ? ` | Desc: ${p.description.substring(0, 100)}...` : '';
                const urlCode = p.slug || p.id || 'notfound';
                const ref = (p.id || '000000').substring(0, 6).toUpperCase();

                return `- Ref ${ref}: [${tipo}] ${p.title} em ${local}. Preço: ${preco}${detalhes}${desc}. Link: https://www.katiaeflavioimoveis.com.br/imovel/${urlCode}`;
            }).join('\n    ');
        }
    } catch (e) {
        console.error("Erro fatal ao carregar inventário:", e);
    }
    return 'Nenhum imóvel disponível no momento.';
}

export async function POST(req: Request) {
    try {
        const { message, history, name } = await req.json();
        const inventory = await getInventory();

        const systemPrompt = `
        Você é Catarina, a assistente virtual da Imobiliária Kátia e Flávio em Praia Grande. 
        Sua missão é ajudar visitantes do SITE a encontrar seu imóvel ideal.

        PERSONAGEM:
        - Nome: Catarina.
        - Tom: Profissional, acolhedora, direta e prestativa.
        - Use emojis moderadamente.

        INVENTÁRIO ATUAL (Use APENAS estes imóveis para recomendações):
        ${inventory}

        REGRAS DE OURO:
        1. Se o cliente perguntar de COMPRA: Sugira imóveis do inventário que combinem com o pedido.
        2. Se pedir ALUGUEL: Informe educadamente que trabalhamos exclusivamente com VENDA.
        3. LINKS: Sempre que citar um imóvel, forneça o link exato que está no inventário.
        4. LEAD: Tente identificar o interesse. Se o cliente parecer interessado, sugira agendar uma visita ou chamar no WhatsApp.
        
        CLASSIFICAÇÃO (No final da resposta):
        Adicione obrigatoriamente [LEAD:QUENTE], [LEAD:MORNO] ou [LEAD:FRIO] com base na conversa.
        `;

        const messages = [
            { role: "system", content: systemPrompt },
            ...history.map((h: any) => ({
                role: h.role === 'user' ? 'user' : 'assistant',
                content: h.content || h.text
            })),
            { role: "user", content: message }
        ];

        // Try multiple models just like in whatsapp-bot.js
        const models = [
            "google/gemini-flash-1.5",
            "openai/gpt-4o-mini",
            "meta-llama/llama-3.1-8b-instruct"
        ];

        let aiText = "";
        let score = "Frio";
        let success = false;

        for (const model of models) {
            try {
                console.log(`🤖 Tentando modelo no site: ${model}...`);
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://www.katiaeflavioimoveis.com.br",
                        "X-Title": "Kátia e Flávio Imóveis"
                    },
                    body: JSON.stringify({ 
                        model: model, 
                        messages, 
                        temperature: 0.7 
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.choices?.[0]?.message?.content) {
                        aiText = data.choices[0].message.content;
                        success = true;
                        break;
                    }
                } else {
                    const errText = await response.text();
                    console.error(`Erro no modelo ${model}:`, errText);
                }
            } catch (err) {
                console.error(`Falha ao chamar ${model}:`, err);
            }
        }

        if (!success) {
            throw new Error("Todos os modelos de IA falharam.");
        }

        // Extract Lead Score
        const scoreMatch = aiText.match(/\[LEAD:(QUENTE|MORNO|FRIO)\]/i);
        if (scoreMatch) {
            score = scoreMatch[1].toUpperCase();
            aiText = aiText.replace(/\[LEAD:(QUENTE|MORNO|FRIO)\]/ig, '').trim();
        }

        return NextResponse.json({ 
            text: aiText,
            score
        });

    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { text: "Desculpe, tive um pequeno problema técnico. Pode tentar novamente?" },
            { status: 500 }
        );
    }
}
