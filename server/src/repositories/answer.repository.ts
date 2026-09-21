import AppDataSource from "../database/connection";
import { Answer } from "../entities/answer.entity";
import { Repository } from "typeorm";

export class AnswerRepository {
  private answerRepository: Repository<Answer>;

  constructor() {
    this.answerRepository = AppDataSource.getRepository(Answer);
  }

  async create(input: Answer): Promise<Answer> {
    return await this.answerRepository.save(input);
  }

  async update(answer: Answer): Promise<Answer> {
    return this.answerRepository.save(answer);
  }

  async delete(id: string): Promise<void> {
    await this.answerRepository.delete(id);
  }

   async incrementLikes(answerId: string): Promise<void> {
    await this.answerRepository.increment({ id: answerId }, 'likes_count', 1);
  }
  async decrementLikes(answerId: string): Promise<void> {
    await this.answerRepository.decrement({ id: answerId }, 'likes_count', 1);
  }

  async getLikesCount(answerId: string): Promise<number> {
    const answer = await this.answerRepository.findOne({
      where: { id: answerId },
      select: ["id", "likes_count"],
    });
    return answer?.likes_count || 0;
  }

  async findById(id: string): Promise<Answer | null> {
    return await this.answerRepository.findOne({
      where: { id },
      relations: [
        "user",
        "comment",
        "comment.user",
        "comment.post",
        "comment.post.user",
      ],
    });
  }
}
