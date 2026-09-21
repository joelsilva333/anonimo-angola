import { Repository } from "typeorm";
import AppDataSource from "../database/connection";
import { PostImpression } from "../entities/post-impression.entity";

export class PostImpressionRepository {
  private repository: Repository<PostImpression>;

  constructor() {
    this.repository = AppDataSource.getRepository(PostImpression);
  }

  async getSeenPostIds(userId: string, postIds: string[]): Promise<Set<string>> {
    if (postIds.length === 0) return new Set();

    const rows = await this.repository
      .createQueryBuilder("impression")
      .select("impression.postId", "postId")
      .where("impression.userId = :userId", { userId })
      .andWhere("impression.postId IN (:...postIds)", { postIds })
      .getRawMany<{ postId: string }>();

    return new Set(rows.map((r) => r.postId));
  }

  /** Regista/actualiza a data de visualização — nunca falha o pedido do feed por causa disto. */
  async recordImpressions(userId: string, postIds: string[]): Promise<void> {
    if (postIds.length === 0) return;

    try {
      await this.repository
        .createQueryBuilder()
        .insert()
        .into(PostImpression)
        .values(postIds.map((postId) => ({ userId, postId })))
        .orIgnore()
        .execute();
    } catch (err) {
      console.error("[PostImpressionRepository] Falha ao registar impressões:", err);
    }
  }
}
