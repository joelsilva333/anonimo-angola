import { Repository } from "typeorm";
import AppDataSource from "../database/connection";
import { PostReaction } from "../entities/post-reaction.entity";
import { ReactionType } from "../entities/reaction.enum";

export class PostReactionRepository {
  private repository: Repository<PostReaction>;

  constructor() {
    this.repository = AppDataSource.getRepository(PostReaction);
  }

  async findByUserAndPost(
    userId: string,
    postId: string,
  ): Promise<PostReaction | null> {
    return await this.repository.findOne({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });
  }

  async save(reaction: PostReaction): Promise<PostReaction> {
    return await this.repository.save(reaction);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
