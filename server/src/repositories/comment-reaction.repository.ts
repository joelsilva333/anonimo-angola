import { Repository } from "typeorm";
import AppDataSource from "../database/connection";
import { CommentReaction } from "../entities/comment-reaction.entity";

export class CommentReactionRepository {
  private repository: Repository<CommentReaction>;

  constructor() {
    this.repository = AppDataSource.getRepository(CommentReaction);
  }

  // Busca se o usuário já reagiu a este comentário específico
  async findByUserAndComment(
    userId: string,
    commentId: string,
  ): Promise<CommentReaction | null> {
    return await this.repository.findOne({
      where: {
        user: { id: userId },
        comment: { id: commentId },
      },
    });
  }

  async save(reaction: CommentReaction): Promise<CommentReaction> {
    return await this.repository.save(reaction);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
