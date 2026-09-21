import { Repository } from "typeorm";
import AppDataSource from "../database/connection";
import { AnswerReaction } from "../entities/answer-reaction.entity";

export class AnswerReactionRepository {
  private repository: Repository<AnswerReaction>;

  constructor() {
    this.repository = AppDataSource.getRepository(AnswerReaction);
  }

  // Busca se o usuário já reagiu a esta resposta específica
  async findByUserAndAnswer(userId: string, answerId: string): Promise<AnswerReaction | null> {
    return await this.repository.findOne({
      where: {
        user: { id: userId },
        answer: { id: answerId },
      },
    });
  }

 

  async save(reaction: AnswerReaction): Promise<AnswerReaction> {
    return await this.repository.save(reaction);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}