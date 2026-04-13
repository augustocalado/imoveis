import axios from "axios";

const apiUrl = process.env.WHATSAPP_API_URL;
const apiKey = process.env.WHATSAPP_API_KEY;
const instance = process.env.WHATSAPP_INSTANCE_NAME;

export async function sendWhatsAppMessage(to: string, message: string) {
  if (!apiUrl || !apiKey || !instance) {
    console.error("Configurações de WhatsApp (API/URL/Key/Instance) ausentes!");
    return null;
  }

  try {
    const response = await axios.post(
      `${apiUrl}/message/sendText/${instance}`,
      {
        number: to,
        options: {
          delay: 1200,
          presence: "composing",
          linkPreview: true,
        },
        textContent: {
          text: message,
        },
      },
      {
        headers: {
          apikey: apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Erro ao enviar mensagem via Evolution API:",
      error.response?.data || error.message
    );
    throw error;
  }
}

export async function sendWhatsAppReadReceipt(number: string) {
  try {
    await axios.post(
      `${apiUrl}/chat/readMessage/${instance}`,
      {
        number,
        read: true,
      },
      {
        headers: {
          apikey: apiKey,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (e) {
    console.error("Erro ao marcar como lido:", e);
  }
}
