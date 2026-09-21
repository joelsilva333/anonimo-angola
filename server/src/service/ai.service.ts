// Nota: segue o mesmo padrão de import dinâmico já usado em support.service.ts
// para o SDK @google/generative-ai (evita problemas de interoperabilidade ESM/CommonJS).

/**
 * AiService centraliza todas as chamadas à API do Google Gemini usadas
 * pelas funcionalidades de Inteligência Artificial do Anônimo Angola:
 *  - Moderação e análise de segurança em tempo real
 *  - Acolhimento automático (primeira resposta de IA)
 *  - Geração de embeddings para o matching por afinidade
 *  - Análise de humor para o diário emocional privado
 *
 * Mantém-se isolado dos serviços de domínio (PostService, etc.) para que
 * a lógica de negócio não dependa directamente do SDK do Gemini.
 */

export type ModerationCategory =
  | "seguro"
  | "odio"
  | "doxxing"
  | "spam"
  | "assedio_sexual";

export interface PostAnalysisResult {
  /** Se o conteúdo deve ser bloqueado (discurso de ódio / vazamento de dados) */
  blocked: boolean;
  category: ModerationCategory;
  reason: string | null;
  /** Sinal de crise emocional/ideação suicida grave detectado no texto */
  crisis: boolean;
  /** Rótulo curto de humor para o diário emocional privado do autor */
  moodLabel: string;
  /** Mensagem breve e empática de acolhimento automático */
  welcomeMessage: string;
  /** Temas/sentimentos identificados, usados como apoio ao matching */
  themeTags: string[];
}

export interface MoodInsight {
  summary: string;
  suggestions: string[];
}

export interface ModerationResult {
  blocked: boolean;
  category: ModerationCategory;
  reason: string | null;
}

export interface AnonNameCheckResult {
  /** true se o nome parecer suficientemente anónimo/genérico */
  anonymous: boolean;
  reason: string | null;
}

const MODEL_TEXT = "gemini-3.5-flash-lite";
const MODEL_EMBEDDING = "text-embedding-004";

const MOOD_LABELS = [
  "Ansioso",
  "Triste",
  "Esperançoso",
  "Grato",
  "Frustrado",
  "Sobrecarregado",
  "Calmo",
  "Confuso",
  "Empático",
  "Solitário",
];

const ANALYSIS_SYSTEM_PROMPT = `
Você é o motor de análise e acolhimento do "Anônimo Angola", uma plataforma anónima de desabafo e apoio emocional.

Analisa o texto de um desabafo e responde APENAS com um objecto JSON válido (sem markdown, sem comentários), com exactamente estes campos:

{
  "blocked": boolean,               // true SOMENTE se contiver discurso de ódio explícito (racismo, xenofobia, incitação à violência contra um grupo), assédio sexual/pedido sexual não solicitado dirigido a alguém, OU vazamento de dados pessoais identificáveis (nome completo + contacto/morada/BI, doxxing de terceiros)
  "category": "seguro" | "odio" | "doxxing" | "spam" | "assedio_sexual",
  "reason": string | null,          // breve explicação em português, amigável, se blocked=true. null caso contrário
  "crisis": boolean,                // true se houver sinais sérios de ideação suicida, autoagressão ou crise emocional aguda
  "mood_label": string,             // UMA palavra/expressão curta em português que descreva o sentimento predominante, escolhida preferencialmente de: ${MOOD_LABELS.join(", ")}. Podes escolher outra palavra curta se nenhuma se adequar bem.
  "welcome_message": string,        // uma mensagem breve (máx. 3 frases), calorosa, empática e acolhedora, validando o sentimento da pessoa. Nunca dá conselhos médicos nem diagnostica. Escreve em português de Angola, tom próximo mas respeitoso. Se crisis=true, inclui um incentivo gentil a procurar apoio, sem ser alarmista.
  "theme_tags": string[]            // 2 a 5 palavras-chave curtas em português (minúsculas) que resumem os temas/sentimentos do desabafo (ex.: "ansiedade académica", "luto", "relacionamento", "solidão", "trabalho")
}

Regras importantes:
- NÃO bloqueies desabafos apenas por conterem linguagem forte, tristeza, raiva ou críticas pessoais — isso é normal e faz parte do espaço de acolhimento.
- Só marca "blocked": true para discurso de ódio genuíno ou exposição de dados pessoais de alguém.
- "crisis" pode ser true mesmo que "blocked" seja false — uma pessoa em crise emocional deve continuar a poder publicar e ser acolhida, nunca bloqueada.
- Responde SEMPRE com JSON válido, nada mais.
`.trim();

const MODERATION_SYSTEM_PROMPT = `
Você é o motor de moderação de segurança do "Anônimo Angola", uma plataforma anónima de desabafo e apoio emocional.

Analisa um comentário, resposta ou mensagem privada escrito por alguém a reagir a um desabafo de outra pessoa, ou a conversar em privado com ela. Responde APENAS com um objecto JSON válido (sem markdown, sem comentários), com exactamente estes campos:

{
  "blocked": boolean,       // true SOMENTE se contiver discurso de ódio explícito (racismo, xenofobia, incitação à violência contra um grupo ou pessoa), assédio/insultos graves dirigidos a alguém, assédio sexual ou conteúdo/pedido sexual não solicitado dirigido a alguém, ou vazamento de dados pessoais identificáveis (doxxing)
  "category": "seguro" | "odio" | "doxxing" | "spam" | "assedio_sexual",
  "reason": string | null   // breve explicação em português, amigável, se blocked=true. null caso contrário
}

Regras importantes:
- NÃO bloqueies apenas por linguagem forte, discordância, críticas ou tristeza — isso é normal numa conversa de apoio.
- Esta plataforma é de apoio emocional a pessoas muitas vezes vulneráveis: qualquer insinuação, pedido ou proposta sexual dirigida a outra pessoa que não seja claramente bem-vinda (paquera não solicitada, pedidos de nudes/fotos, propostas de encontro/sexo, comentários sexualizados sobre o corpo de alguém) deve ser bloqueada com "category": "assedio_sexual", mesmo que o texto pareça "suave" ou use eufemismos/censura (ex: asteriscos a substituir palavras).
- Só marca "blocked": true para discurso de ódio genuíno, assédio/insulto grave dirigido a alguém, assédio sexual, ou exposição de dados pessoais.
- Responde SEMPRE com JSON válido, nada mais.
`.trim();

const ANON_NAME_SYSTEM_PROMPT = `
Você é o verificador de anonimato de nomes de utilizador do "Anônimo Angola", uma plataforma de desabafo anónimo. As pessoas escolhem um pseudónimo curto para usar na plataforma — a tua função é impedir que escolham algo que na prática revele quem são.

Recebes uma única palavra/expressão curta (o pseudónimo escolhido). Responde APENAS com um objecto JSON válido, com exactamente estes campos:

{
  "anonymous": boolean,   // false se o nome parecer um nome próprio real (nome e/ou apelido, ex: "joaopedro", "mariasilva92", "ana.dossantos"), conter um número de telefone, email, ou qualquer informação que identifique a pessoa
  "reason": string | null // breve explicação em português, amigável, sugerindo trocar por algo mais genérico, se anonymous=false. null caso contrário
}

Regras importantes:
- Nomes genéricos, inventados, temáticos ou com números aleatórios são SEMPRE anónimos (ex: "sombra123", "luz_da_noite", "user4821", "anonimo99").
- Só marca "anonymous": false quando o nome parecer claramente um nome próprio/apelido real de pessoa, ou contiver dados de contacto.
- Na dúvida, considera anónimo (não sejas excessivamente restritivo).
- Responde SEMPRE com JSON válido, nada mais.
`.trim();

const MOOD_INSIGHT_PROMPT = `
Você é um assistente de bem-estar do "Anônimo Angola". Vais receber APENAS uma lista agregada e anónima de rótulos de humor recentes de um utilizador (nunca o texto original dos desabafos, para preservar a privacidade).

Com base só nessa lista, responde EXCLUSIVAMENTE com um objecto JSON:
{
  "summary": string,        // 1-2 frases empáticas resumindo a tendência emocional recente, em português de Angola
  "suggestions": string[]   // 2 a 3 sugestões leves e práticas de autocuidado, curtas (máx. 1 frase cada), nunca conselhos médicos
}
`.trim();

async function getClient() {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
}

function extractJson<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const jsonSlice = start >= 0 && end >= 0 ? cleaned.slice(start, end + 1) : cleaned;

  return JSON.parse(jsonSlice) as T;
}

export class AiService {
  /**
   * Analisa um desabafo: moderação de segurança, detecção de crise,
   * humor predominante, mensagem de acolhimento e temas.
   *
   * Em caso de falha de comunicação com o Gemini, faz um "fail-open" seguro:
   * nunca bloqueia a publicação por causa de um erro técnico, mas também
   * não gera acolhimento automático nesse caso.
   */
  async analyzePost(text: string): Promise<PostAnalysisResult> {
    const fallback: PostAnalysisResult = {
      blocked: false,
      category: "seguro",
      reason: null,
      crisis: false,
      moodLabel: "Neutro",
      welcomeMessage:
        "Obrigado por partilhares o que sentes aqui. A tua voz importa e alguém desta comunidade vai lê-la com carinho.",
      themeTags: [],
    };

    if (!process.env.GEMINI_API_KEY) {
      console.warn("[AiService] GEMINI_API_KEY não configurada — a usar fallback.");
      return fallback;
    }

    try {
      const genAI = await getClient();
      const model = genAI.getGenerativeModel({
        model: MODEL_TEXT,
        systemInstruction: ANALYSIS_SYSTEM_PROMPT,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 500,
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent(text);
      const raw = result.response.text();

      const parsed = extractJson<{
        blocked: boolean;
        category: ModerationCategory;
        reason: string | null;
        crisis: boolean;
        mood_label: string;
        welcome_message: string;
        theme_tags: string[];
      }>(raw);

      return {
        blocked: !!parsed.blocked,
        category: parsed.category ?? "seguro",
        reason: parsed.reason ?? null,
        crisis: !!parsed.crisis,
        moodLabel: parsed.mood_label || fallback.moodLabel,
        welcomeMessage: parsed.welcome_message || fallback.welcomeMessage,
        themeTags: Array.isArray(parsed.theme_tags) ? parsed.theme_tags.slice(0, 5) : [],
      };
    } catch (err) {
      console.error("[AiService] Erro ao analisar post com Gemini:", err);
      return fallback;
    }
  }

  /**
   * Moderação leve (sem humor/crise/acolhimento) usada em comentários e
   * respostas — uma barreira contra conteúdo ofensivo, discurso de ódio
   * ou doxxing. Fail-open em caso de falha técnica: nunca bloqueia por erro.
   */
  async moderateContent(text: string): Promise<ModerationResult> {
    const fallback: ModerationResult = {
      blocked: false,
      category: "seguro",
      reason: null,
    };

    if (!process.env.GEMINI_API_KEY || !text.trim()) {
      return fallback;
    }

    try {
      const genAI = await getClient();
      const model = genAI.getGenerativeModel({
        model: MODEL_TEXT,
        systemInstruction: MODERATION_SYSTEM_PROMPT,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 200,
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent(text);
      const parsed = extractJson<{
        blocked: boolean;
        category: ModerationCategory;
        reason: string | null;
      }>(result.response.text());

      return {
        blocked: !!parsed.blocked,
        category: parsed.category ?? "seguro",
        reason: parsed.reason ?? null,
      };
    } catch (err) {
      console.error("[AiService] Erro ao moderar conteúdo com Gemini:", err);
      return fallback;
    }
  }

  /**
   * Verifica se um pseudónimo escolhido é suficientemente anónimo (não
   * parece um nome próprio real nem contém dados de contacto). Fail-open:
   * nunca bloqueia por falha técnica — a validação de formato feita antes
   * (comprimento, caracteres permitidos) já dá alguma proteção mínima.
   */
  async checkAnonymousName(name: string): Promise<AnonNameCheckResult> {
    const fallback: AnonNameCheckResult = { anonymous: true, reason: null };

    if (!process.env.GEMINI_API_KEY || !name.trim()) {
      return fallback;
    }

    try {
      const genAI = await getClient();
      const model = genAI.getGenerativeModel({
        model: MODEL_TEXT,
        systemInstruction: ANON_NAME_SYSTEM_PROMPT,
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 150,
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent(name);
      const parsed = extractJson<{
        anonymous: boolean;
        reason: string | null;
      }>(result.response.text());

      return {
        anonymous: parsed.anonymous !== false,
        reason: parsed.anonymous === false ? parsed.reason ?? null : null,
      };
    } catch (err) {
      console.error("[AiService] Erro ao verificar anonimato do nome:", err);
      return fallback;
    }
  }

  /**
   * Gera um vector de embedding para o texto, usado no matching por afinidade.
   * Retorna null se não for possível gerar (ex.: falha de rede/API).
   */
  async embedText(text: string): Promise<number[] | null> {
    if (!process.env.GEMINI_API_KEY) return null;

    try {
      const genAI = await getClient();
      const model = genAI.getGenerativeModel({ model: MODEL_EMBEDDING });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (err) {
      console.error("[AiService] Erro ao gerar embedding com Gemini:", err);
      return null;
    }
  }

  /** Similaridade de cosseno entre dois vectores de mesma dimensão. */
  cosineSimilarity(a: number[], b: number[]): number {
    if (!a || !b || a.length !== b.length || a.length === 0) return 0;

    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Gera um pequeno resumo empático + sugestões de autocuidado a partir de
   * uma lista agregada de rótulos de humor (nunca do texto original dos posts).
   */
  async generateMoodInsight(moodLabels: string[]): Promise<MoodInsight> {
    const fallback: MoodInsight = {
      summary:
        "Ainda não há dados suficientes para traçar uma tendência, mas cada desabafo que partilhas ajuda-nos a conhecer-te melhor.",
      suggestions: [
        "Reserva 5 minutos hoje para respirar fundo e fazer uma pausa.",
        "Fala com alguém de confiança sobre como te sentes.",
      ],
    };

    if (!process.env.GEMINI_API_KEY || moodLabels.length === 0) return fallback;

    try {
      const genAI = await getClient();
      const model = genAI.getGenerativeModel({
        model: MODEL_TEXT,
        systemInstruction: MOOD_INSIGHT_PROMPT,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 300,
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent(
        `Rótulos de humor recentes (do mais antigo ao mais recente): ${moodLabels.join(", ")}`,
      );
      const parsed = extractJson<MoodInsight>(result.response.text());

      return {
        summary: parsed.summary || fallback.summary,
        suggestions:
          Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0
            ? parsed.suggestions.slice(0, 3)
            : fallback.suggestions,
      };
    } catch (err) {
      console.error("[AiService] Erro ao gerar insight de humor com Gemini:", err);
      return fallback;
    }
  }
}

export default new AiService();
