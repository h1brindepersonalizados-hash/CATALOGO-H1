import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function askGemini(question: string, context: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: question,
      config: {
        systemInstruction: `Você é o assistente virtual da H1 Brindes Personalizados. 
        Responda as dúvidas dos clientes de forma educada, prestativa e profissional.
        
        Informações da Loja:
        - Prazo de confecção: 15 dias úteis.
        - Especialidade: Brindes de luxo (Necessaires, Mochilas, Kits Corporativos, Bolsas, Frasqueiras).
        - Personalização: Todos os itens podem ser personalizados de acordo com o pedido do cliente.
        - Orçamento: O cliente adiciona itens ao carrinho e envia via WhatsApp para um consultor.
        
        Contexto dos produtos disponíveis:
        ${context}
        
        Mantenha as respostas curtas e diretas. Se não souber algo, peça para falarem com um consultor via WhatsApp.`,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, tive um probleminha. Pode tentar perguntar novamente ou chamar a gente no WhatsApp?";
  }
}
