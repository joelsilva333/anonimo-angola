import badWordsFilter from "../utils/bad-words-filter";
import { CreatePostDTO, UpdatePostDTO } from "../dto/post.dto";
import { Post } from "../entities/post.entity";
import { PostInterface } from "../interfaces/post.interface";
import { PostRepository } from "../repositories/post.repository";
import { UserRepository } from "../repositories/user.repository";
import leoProfanity from "leo-profanity";
import { PostReactionRepository } from "../repositories/post-reaction.repository";
import { CommentReactionRepository } from "../repositories/comment-reaction.repository";
import { AnswerReactionRepository } from "../repositories/answer-reaction.repository";
import { CommentRepository } from "../repositories/comment.repository";
import { FollowRepository } from "../repositories/follow.repository";
import { PostImpressionRepository } from "../repositories/post-impression.repository";
import aiService, { PostAnalysisResult } from "./ai.service";
import moderationService from "./moderation.service";
import { ModerationBlockedError } from "../utils/errors";
import blockService from "./block.service";

export { ModerationBlockedError };

export class PostService {
  private postRepository: PostRepository;
  private userRepository: UserRepository;
  private postReactionRepository: PostReactionRepository;
  private commentReactionRepository: CommentReactionRepository;
  private answerReactionRepository: AnswerReactionRepository;
  private commentRepository: CommentRepository;
  private followRepository: FollowRepository;
  private postImpressionRepository: PostImpressionRepository;

  constructor() {
    this.postRepository = new PostRepository();
    this.userRepository = new UserRepository();
    this.postReactionRepository = new PostReactionRepository();
    this.commentReactionRepository = new CommentReactionRepository();
    this.answerReactionRepository = new AnswerReactionRepository();
    this.commentRepository = new CommentRepository();
    this.followRepository = new FollowRepository();
    this.postImpressionRepository = new PostImpressionRepository();
  }

  private async mapPostsWithRelationsAndReactions(posts: Post[], currentUserId?: string): Promise<any[]> {
    return await Promise.all(
      posts.map(async (post) => {
        let postReaction = null;
        if (currentUserId) {
          postReaction = await this.postReactionRepository.findByUserAndPost(currentUserId, post.id);
        }

        const commentsMapped = post.comments
          ? await Promise.all(
              post.comments.map(async (comment) => {
                let commentReaction = null;
                if (currentUserId) {
                  commentReaction = await this.commentReactionRepository.findByUserAndComment(currentUserId, comment.id);
                }

                const answersMapped = comment.answers
                  ? await Promise.all(
                      comment.answers.map(async (answer) => {
                        let answerReaction = null;
                        if (currentUserId) {
                          answerReaction = await this.answerReactionRepository.findByUserAndAnswer(currentUserId, answer.id);
                        }

                        return {
                          ...answer,
                          has_reacted: !!answerReaction,
                          reaction_type: answerReaction ? answerReaction.type : null,
                        };
                      }),
                    )
                  : [];

                return {
                  ...comment,
                  answers: answersMapped,
                  has_reacted: !!commentReaction,
                  reaction_type: commentReaction ? commentReaction.type : null,
                };
              }),
            )
          : [];

        return {
          ...post,
          comments: commentsMapped,
          has_reacted: !!postReaction,
          reaction_type: postReaction ? postReaction.type : null,
        };
      }),
    );
  }

  /**
   * Cria um novo desabafo, passando primeiro pela análise de segurança da IA
   * (Gemini). Se for detectado discurso de ódio ou vazamento de dados
   * pessoais, a publicação é impedida com ModerationBlockedError.
   *
   * Em caso de sinal de crise emocional, o desabafo continua a ser publicado
   * (nunca bloqueamos alguém em sofrimento), mas o post fica marcado com
   * `ai_crisis_detected` para que o frontend possa mostrar o banner de apoio.
   *
   * Depois de guardado, gera-se também:
   *  - um rótulo de humor privado (diário emocional)
   *  - um embedding para o matching por afinidade
   */
  async create(input: CreatePostDTO, id: string): Promise<Post> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error("Usuário não encontrado");

    const cleanedText = badWordsFilter(leoProfanity.clean(input.text));

    const analysis: PostAnalysisResult = await aiService.analyzePost(cleanedText);

    if (analysis.blocked) {
      await moderationService.recordViolationAndMaybeBan(
        id,
        "post",
        analysis.category,
        analysis.reason,
      );
      throw new ModerationBlockedError(
        analysis.reason ||
          "Este conteúdo não pode ser publicado por violar as regras de segurança da comunidade.",
        analysis.category,
      );
    }

    const post = new Post();
    post.user = user;
    post.text = cleanedText;
    post.created_at = new Date();
    post.status = "active";
    post.mood_label = analysis.moodLabel;
    post.ai_crisis_detected = analysis.crisis;
    post.theme_tags = analysis.themeTags;

    const savedPost = await this.postRepository.create(post);

    // Gera o embedding para o matching por afinidade (não bloqueia a resposta em caso de falha).
    try {
      const embedding = await aiService.embedText(cleanedText);
      if (embedding) {
        savedPost.embedding = embedding;
        await this.postRepository.update(savedPost);
      }
    } catch (err) {
      console.error("[PostService] Falha ao gerar embedding do post:", err);
    }

    const fresh = await this.postRepository.findByPostId(savedPost.id);
    return fresh || savedPost;
  }

  /**
   * Devolve até `limit` desabafos com temas/sentimentos semelhantes ao post
   * indicado, com base na similaridade de cosseno entre embeddings gerados
   * pelo Gemini ("Relatos semelhantes que podes querer ler").
   */
  async findSimilar(postId: string, limit = 3): Promise<any[]> {
    const target = await this.postRepository.findByPostId(postId);
    if (!target) throw new Error("Post não encontrado");
    if (!target.embedding) return [];

    const allPosts = await this.postRepository.findAll();

    const scored = allPosts
      .filter(
        (p) =>
          p.id !== target.id &&
          p.status === "active" &&
          Array.isArray(p.embedding) &&
          p.embedding.length > 0,
      )
      .map((p) => ({
        post: p,
        score: aiService.cosineSimilarity(target.embedding as number[], p.embedding as number[]),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored.map(({ post, score }) => ({
      id: post.id,
      anon_name: post.user?.anon_name,
      profile_picture: post.user?.profile_picture,
      text: post.text.length > 220 ? `${post.text.slice(0, 220)}…` : post.text,
      created_at: post.created_at,
      theme_tags: post.theme_tags || [],
      similarity: Math.round(score * 100) / 100,
    }));
  }

  /** Tamanho do conjunto de candidatos recentes sobre o qual o feed é pontuado. */
  private static readonly FEED_CANDIDATE_POOL = 300;
  /** Meia-vida da recência, em horas — decaimento suave, não corte abrupto. */
  private static readonly RECENCY_HALF_LIFE_HOURS = 48;

  private averageVector(vectors: number[][]): number[] | null {
    if (vectors.length === 0) return null;
    const length = vectors[0].length;
    const sum = new Array(length).fill(0);
    for (const vector of vectors) {
      for (let i = 0; i < length; i++) sum[i] += vector[i] ?? 0;
    }
    return sum.map((v) => v / vectors.length);
  }

  /**
   * Feed principal: uma lista única, já ordenada por um score que combina
   * recência, afinidade temática (via embeddings — o "coração" do
   * algoritmo), um pequeno impulso para quem segues, e engagement como
   * critério de desempate leve (de propósito — não queremos que o feed
   * recompense o que é mais dramático/viral, e sim o que é mais relevante
   * para a pessoa). Posts já vistos são penalizados, nunca escondidos.
   *
   * Sem `currentUserId` (visitante), cai para ordem cronológica simples.
   */
  async findAll(
    currentUserId?: string,
    page = 1,
    pageSize = 15,
  ): Promise<any[]> {
    const allCandidates = await this.postRepository.findCandidates(
      PostService.FEED_CANDIDATE_POOL,
    );

    const hiddenUserIds = currentUserId
      ? await blockService.getHiddenUserIds(currentUserId)
      : new Set<string>();
    const candidates = hiddenUserIds.size
      ? allCandidates.filter((p) => !hiddenUserIds.has(p.user.id))
      : allCandidates;

    if (!currentUserId) {
      const chronological = candidates.slice(
        (page - 1) * pageSize,
        page * pageSize,
      );
      return this.mapPostsWithRelationsAndReactions(chronological, currentUserId);
    }

    const [affinityVectors, followedIds, seenPostIds] = await Promise.all([
      this.postRepository.findRecentEmbeddingsByUserId(currentUserId, 10),
      this.followRepository.findFollowing(currentUserId, 500, 0),
      this.postImpressionRepository.getSeenPostIds(
        currentUserId,
        candidates.map((p) => p.id),
      ),
    ]);

    const affinityProfile = this.averageVector(affinityVectors);
    const followedUserIds = new Set(followedIds.items.map((f) => f.followingId));
    const now = Date.now();

    const scored = candidates.map((post) => {
      const hoursSincePost = (now - new Date(post.created_at).getTime()) / 3_600_000;
      const recencyScore = Math.exp(
        -hoursSincePost / PostService.RECENCY_HALF_LIFE_HOURS,
      );

      const affinityScore =
        affinityProfile && Array.isArray(post.embedding) && post.embedding.length > 0
          ? aiService.cosineSimilarity(affinityProfile, post.embedding)
          : 0;

      const followBoost = followedUserIds.has(post.user.id) ? 1 : 0;
      const engagementScore = Math.log(1 + post.likes_count + (post.comments?.length || 0));
      const seenPenalty = seenPostIds.has(post.id) ? 1 : 0;

      const score =
        1.0 * recencyScore +
        1.5 * affinityScore +
        0.5 * followBoost +
        0.2 * engagementScore -
        0.8 * seenPenalty;

      return { post, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const page_ = scored
      .slice((page - 1) * pageSize, page * pageSize)
      .map((s) => s.post);

    // Não bloqueia a resposta do feed — é só telemetria para o próximo pedido.
    this.postImpressionRepository
      .recordImpressions(currentUserId, page_.map((p) => p.id))
      .catch((err) => console.error("Falha ao registar impressões do feed:", err));

    return this.mapPostsWithRelationsAndReactions(page_, currentUserId);
  }

  async findById(id: string, currentUserId?: string): Promise<any> {
    const post = await this.postRepository.findByPostId(id);
    if (!post) throw new Error("Post não encontrado");

    const mappedPost = await this.mapPostsWithRelationsAndReactions([post], currentUserId);
    return mappedPost[0];
  }

  async findAllByUserId(userId: string): Promise<any[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("Usuário não encontrado");
    
    const posts = await this.postRepository.findAllByUserId(userId);
    return this.mapPostsWithRelationsAndReactions(posts, userId);
  }

  /**
   * Diário Emocional / Mood Tracker privado: analisa o histórico recente de
   * desabafos do próprio utilizador e devolve uma tendência de humor com
   * sugestões leves de autocuidado. Apenas os rótulos de humor (nunca o
   * texto dos desabafos) são enviados ao Gemini para gerar as sugestões,
   * preservando a privacidade do conteúdo.
   */
  async getMoodTracker(userId: string): Promise<{
    timeline: { date: Date; mood: string }[];
    moodCounts: Record<string, number>;
    summary: string;
    suggestions: string[];
  }> {
    const posts = await this.postRepository.findAllByUserId(userId);
    const relevant = posts.filter((p) => p.status !== "deleted").slice(0, 20).reverse();

    const timeline = relevant.map((p) => ({
      date: p.created_at,
      mood: p.mood_label || "Neutro",
    }));

    const moodCounts: Record<string, number> = {};
    for (const entry of timeline) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    }

    const insight = await aiService.generateMoodInsight(timeline.map((t) => t.mood));

    return {
      timeline,
      moodCounts,
      summary: insight.summary,
      suggestions: insight.suggestions,
    };
  }

  async update(userId: string, postId: string, dto: UpdatePostDTO): Promise<Post> {
    const post = await this.postRepository.findByPostId(postId);
    if (!post) throw new Error("Post não encontrado");
    if (post.user.id !== userId) throw new Error("Não autorizado");

    if (dto.text) {
      post.text = badWordsFilter(leoProfanity.clean(dto.text));
    }
    post.status = dto.status ?? post.status;

    return await this.postRepository.update(post);
  }

  async delete(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findByPostId(postId);
    if (!post) throw new Error("Post não encontrado");
    if (post.user.id !== userId) throw new Error("Não autorizado");
    
    await this.postRepository.delete(postId);
  }
}