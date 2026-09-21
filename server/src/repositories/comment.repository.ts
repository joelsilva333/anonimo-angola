import AppDataSource from "../database/connection";
import { Comment } from "../entities/comment.entity";
import { Repository } from "typeorm";

export class CommentRepository {
  private commentRepository: Repository<Comment>;

  constructor() {
    this.commentRepository = AppDataSource.getRepository(Comment);
  }

  async create(comment: Comment): Promise<Comment> {
    return this.commentRepository.save(comment);
  }

  async update(comment: Comment): Promise<Comment> {
    return this.commentRepository.save(comment);
  }

  async delete(id: string): Promise<void> {
    await this.commentRepository.delete(id);
  }

  async incrementLikes(commentId: string): Promise<void> {
    await this.commentRepository.increment({ id: commentId }, "likes_count", 1);
  }
  async decrementLikes(commentId: string): Promise<void> {
    await this.commentRepository.decrement({ id: commentId }, "likes_count", 1);
  }

  async getLikesCount(commentId: string): Promise<number> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      select: ["id", "likes_count"],
    });
    return comment?.likes_count || 0;
  }

  async findById(id: string): Promise<Comment | null> {
    return this.commentRepository.findOne({
      where: { id },
      relations: ["user", "post", "post.user"],
    });
  }
}
