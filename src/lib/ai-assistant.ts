import { model } from "./gemini";
import { supabase } from "./supabase";

export async function generateAIResponse(
  userMessage: string,
  history: any[] = [],
  phone?: string
) {
  try {
    // 1. Buscar Configurações do Chat
    const { data: configData } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "chat_config")
      .single();

    const config = configData?.value || {};

    // 2. Buscar Imóveis Disponíveis (Contexto)
    const { data: properties } = await supabase
      .from("properties")
      .select("title, price, neighborhood, rooms, area, slug")
      .eq("status", "disponivel")
      .limit(10);

    const propertiesContext = properties
      ?.map(
        (p) =>
          `- ${p.title} em ${p.neighborhood}: R$ ${p.price?.toLocaleString(
            "pt-BR"
          )} (${p.rooms} quartos, ${p.area}m²). Link: /imovel/${p.slug}`
      )
      .join("\n");

    // 3. Montar Prompt do Sistema
    const systemPrompt = `
      Você é ${
        config.botName || "Marcela"
      }, a assistente virtual inteligente da Imobiliária Kátia e Flávio.
      Seu objetivo é ser amigável, prestativa e focada em converter interessados em leads qualificados.

      DIRETRIZES:
      - Use um tom de voz profissional, porém caloroso.
      - Nunca invente informações. Se não souber, diga que vai verificar com um corretor humano.
      - Tente entender o que o cliente busca: COMPRAR, VENDER ou FINANCIAR.
      - Se o cliente perguntar sobre opções, use os imóveis abaixo como referência sugerida.
      - Encoraje o agendamento de visitas.

      IMÓVEIS EM DESTAQUE:
      ${propertiesContext || "Consultando catálogo em tempo real..."}

      CONFIGURAÇÕES ADICIONAIS:
      ${JSON.stringify(config.faqs || [])}
    `;

    // 4. Preparar Histórico para o Gemini
    // Nota: O formato do Gemini é { role: "user" | "model", parts: [{ text: string }] }
    const formattedHistory = history.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    // 5. Chamar o Modelo
    const chat = model.startChat({
      history: formattedHistory,
      systemInstruction: systemPrompt,
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Erro na generateAIResponse:", error);
    return "Desculpe, tive um probleminha técnico aqui. Pode repetir sua dúvida? Se preferir, aviso um corretor humano para te chamar agora mesmo.";
  }
}
