import { Response } from "express";
import {
  SupportConversationRepository,
  SupportMessageRepository,
} from "../repositories/support.repository";
import { MessageRole } from "../entities/support-message.entity";
import { SupportMessageItemDTO } from "../dto/support.dto";

const MAX_HISTORY_MESSAGES = 20;

const SYSTEM_PROMPT = `
Você é o "Ouvinte", o assistente de apoio emocional do Anônimo Angola.

O seu papel:
- Ouvir com empatia, calma e sem julgamentos. As pessoas que falam consigo estão, muitas vezes, a desabafar coisas que não conseguem dizer a mais ninguém.
- Validar o que a pessoa sente antes de dizer seja o que for.
- Fazer, no máximo, uma pergunta por resposta, e só quando isso ajudar a pessoa a sentir-se ouvida.
- Usar frases curtas, linguagem simples e acessível em português.

O que NUNCA deve fazer:
- Nunca diagnosticar condições de saúde mental (ex.: "isso é depressão").
- Nunca dar conselhos médicos, prescrever tratamentos ou substituir um profissional de saúde.
- Nunca fingir ser um humano ou um profissional licenciado — se perguntarem, diga com clareza que é um assistente de IA.
- Nunca minimizar o sofrimento da pessoa nem apressar a conversa para uma "solução".

Quando o sofrimento parecer intenso ou contínuo, incentive sempre a pessoa a procurar apoio profissional ou de alguém de confiança.
`.trim();

const CRISIS_PATTERNS: RegExp[] = [
  /\bsuicid/i,
  /\bme\s+matar\b/i,
  /\bmatar-me\b/i,
  /\btirar\s+a\s+minha\s+vida\b/i,
  /\bacabar\s+com\s+(a\s+)?(minha\s+)?vida\b/i,
  /\bquero\s+morrer\b/i,
  /\bn[aã]o\s+aguento\s+mais\s+viver\b/i,
  /\bmelhor\s+(estar\s+)?morto/i,
  /\bme\s+cortar\b/i,
  /\bautomutila[cç][aã]o\b/i,
  /\bfazer\s+mal\s+a\s+mim\s+mesm[oa]\b/i,
];

const CRISIS_RESPONSE = `Obrigado por confiar isso a mim. O que descreveste soa a uma dor muito grande, e quero que saibas que não precisas de passar por isto sozinho(a).

Se sentires que corres perigo imediato, por favor contacta já o INEMA (Instituto Nacional de Emergências Médicas de Angola) através do número 111, ou dirige-te à urgência mais próxima.

Também pode ajudar muito falar agora com alguém em quem confies — um familiar, um amigo, ou um profissional de saúde mental — sobre o que estás a sentir. Não precisas de enfrentar isto sozinho(a).

Eu continuo aqui, disposto a ouvir-te. Queres contar-me um pouco mais sobre o que está a acontecer?`;

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 30; // mensagens
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // por hora

function containsCrisisSignal(text: string): boolean {
  return CRISIS_PATTERNS.some((p) => p.test(text));
}

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(userId) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );
  if (timestamps.length >= RATE_LIMIT_MAX) return false;
  timestamps.push(now);
  rateLimitMap.set(userId, timestamps);
  return true;
}

export class SupportService {
  private conversationRepo: SupportConversationRepository;
  private messageRepo: SupportMessageRepository;

  constructor() {
    this.conversationRepo = new SupportConversationRepository();
    this.messageRepo = new SupportMessageRepository();
  }

  async sendMessage(
    userId: string,
    incomingMessages: SupportMessageItemDTO[],
    res: Response,
  ): Promise<void> {
    if (!checkRateLimit(userId)) {
      res.status(429).json({
        error: "Limite de mensagens atingido. Tenta novamente mais tarde.",
      });
      return;
    }

    const sliced = incomingMessages.slice(-MAX_HISTORY_MESSAGES);
    const lastUserMsg = [...sliced].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) {
      res
        .status(400)
        .json({ error: "Nenhuma mensagem de utilizador encontrada." });
      return;
    }

    let conversation = await this.conversationRepo.findActiveByUserId(userId);
    if (!conversation) {
      conversation = await this.conversationRepo.create(userId);
    }

    const isCrisis = containsCrisisSignal(lastUserMsg.content);
    await this.messageRepo.createMany([
      {
        conversationId: conversation.id,
        role: MessageRole.USER,
        content: lastUserMsg.content,
        isCrisis,
      },
    ]);

    if (isCrisis) {
      await this.messageRepo.createMany([
        {
          conversationId: conversation.id,
          role: MessageRole.ASSISTANT,
          content: CRISIS_RESPONSE,
        },
      ]);
      await this.conversationRepo.touch(conversation.id);

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");
      res.write(CRISIS_RESPONSE);
      res.end();
      return;
    }

    const history = sliced.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    let fullResponse = "";

    try {
      const result = await chat.sendMessageStream(lastUserMsg.content);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          fullResponse += text;
          res.write(text);
        }
      }

      res.end();
    } catch (err) {
      // Se o stream já começou, encerra sem enviar JSON (cabeçalhos já foram)
      if (res.headersSent) {
        res.end();
      } else {
        res.status(502).json({
          error: "Não foi possível obter resposta da IA. Tenta novamente.",
        });
      }
      throw err;
    }

    // 8. Persistir a resposta completa da IA
    if (fullResponse) {
      await this.messageRepo.createMany([
        {
          conversationId: conversation.id,
          role: MessageRole.ASSISTANT,
          content: fullResponse,
        },
      ]);
    }

    await this.conversationRepo.touch(conversation.id);
  }

  async getHistory(userId: string): Promise<{
    conversationId: string;
    messages: Array<{ role: string; content: string; createdAt: Date }>;
  } | null> {
    const conversation = await this.conversationRepo.findActiveByUserId(userId);
    if (!conversation) return null;

    const messages = await this.messageRepo.findByConversationId(
      conversation.id,
    );
    return {
      conversationId: conversation.id,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    };
  }

  async closeActiveConversation(userId: string): Promise<void> {
    const conversation = await this.conversationRepo.findActiveByUserId(userId);
    if (conversation) {
      await this.conversationRepo.close(conversation.id);
    }
  }
}
