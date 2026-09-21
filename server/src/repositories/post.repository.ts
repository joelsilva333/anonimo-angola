import AppDataSource from "../database/connection";
import { Post } from "../entities/post.entity";
import { In, Repository } from "typeorm";

export class PostRepository {
  private postRepository: Repository<Post>;

  constructor() {
    this.postRepository = AppDataSource.getRepository(Post);
  }

  async create(post: Post): Promise<Post> {
    return await this.postRepository.save(post);
  }

  async findByPostId(id: string): Promise<Post | null> {
    return await this.postRepository.findOne({
      where: { id },
      relations: ["user",  "comments", "comments.user", "comments.answers", "comments.answers.user"],
    });
  }

   async incrementLikes(postId: string): Promise<void> {
      await this.postRepository.increment({ id: postId }, "likes_count", 1);
    }
    async decrementLikes(postId: string): Promise<void> {
      await this.postRepository.decrement({ id: postId }, "likes_count", 1);
    }

    async getLikesCount(postId: string): Promise<number> {
      const post = await this.postRepository.findOne({
        where: { id: postId },
        select: ["id", "likes_count"],
      });
      return post?.likes_count || 0;
    }

  async findByUserId(postId: string, userId: string): Promise<Post | null> {
    return await this.postRepository.findOne({
      where: { id: postId, user: { id: userId } },
    });
  }

  async findAllByUserId(userId: string): Promise<Post[]> {
    return await this.postRepository.find({
      where: { user: { id: userId } },
      relations: ["user", "comments", "comments.user"],
      order: { created_at: "DESC" },
    });
  }

  async findAll(): Promise<Post[]> {
    return await this.postRepository.find({
      relations: [
        "user",
        "comments",
        "comments.user",
        "comments.answers",
        "comments.answers.user",
      ],
      order: { created_at: "DESC" },
    });
  }

  /**
   * Conjunto de candidatos para o feed: os posts activos mais recentes,
   * limitados a `limit` (o ranking é feito em memória sobre este conjunto,
   * evitando varrer a tabela inteira a cada pedido).
   *
   * Feito em dois passos (IDs primeiro, depois as relações) porque
   * `take`/`skip` combinado com relações one-to-many faz o TypeORM gerar
   * SQL inválido (tenta paginar com DISTINCT sobre colunas que não
   * existem na subquery).
   */
  async findCandidates(limit: number): Promise<Post[]> {
    const recentIds = await this.postRepository.find({
      where: { status: "active" },
      order: { created_at: "DESC" },
      take: limit,
      select: ["id"],
    });

    const ids = recentIds.map((p) => p.id);
    if (ids.length === 0) return [];

    const posts = await this.postRepository.find({
      where: { id: In(ids) },
      relations: [
        "user",
        "comments",
        "comments.user",
        "comments.answers",
        "comments.answers.user",
      ],
    });

    const byId = new Map(posts.map((p) => [p.id, p]));
    return ids.map((id) => byId.get(id)).filter((p): p is Post => !!p);
  }

  /** Embeddings dos posts mais recentes do utilizador, para calcular o seu "perfil" de afinidade. */
  async findRecentEmbeddingsByUserId(
    userId: string,
    limit: number,
  ): Promise<number[][]> {
    const posts = await this.postRepository
      .createQueryBuilder("post")
      .select(["post.id", "post.embedding"])
      .where("post.userId = :userId", { userId })
      .andWhere("post.status = :status", { status: "active" })
      .orderBy("post.created_at", "DESC")
      .limit(limit)
      .getMany();

    return posts
      .map((p) => p.embedding)
      .filter((e): e is number[] => Array.isArray(e) && e.length > 0);
  }

  async update(post: Post): Promise<Post> {
    return await this.postRepository.save(post);
  }

  async delete(id: string): Promise<void> {
    await this.postRepository.delete(id);
  }

  async countTotal(): Promise<number> {
    return this.postRepository.count();
  }

  async countByStatus(status: "active" | "deleted" | "flagged"): Promise<number> {
    return this.postRepository.count({ where: { status } });
  }

  async countCrisisDetected(): Promise<number> {
    return this.postRepository.count({ where: { ai_crisis_detected: true } });
  }

  async countCreatedSince(since: Date): Promise<number> {
    return this.postRepository
      .createQueryBuilder("post")
      .where("post.created_at >= :since", { since })
      .getCount();
  }
}
