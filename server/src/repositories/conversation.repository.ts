import { Repository } from "typeorm";
import AppDataSource from "../database/connection";
import { Conversation } from "../entities/conversation.entity";

export class ConversationRepository {
  private repository: Repository<Conversation>;

  constructor() {
    this.repository = AppDataSource.getRepository(Conversation);
  }

  async findBetween(
    userAId: string,
    userBId: string,
  ): Promise<Conversation | null> {
    return this.repository.findOne({
      where: { userAId, userBId },
      relations: ["userA", "userB"],
    });
  }

  async findById(id: string): Promise<Conversation | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["userA", "userB"],
    });
  }

  async create(conversation: Conversation): Promise<Conversation> {
    return this.repository.save(conversation);
  }

  async touch(id: string): Promise<void> {
    await this.repository.update(id, { lastMessageAt: new Date() });
  }

  async findAllForUser(userId: string): Promise<Conversation[]> {
    return this.repository
      .createQueryBuilder("conversation")
      .leftJoinAndSelect("conversation.userA", "userA")
      .leftJoinAndSelect("conversation.userB", "userB")
      .where("conversation.userAId = :userId OR conversation.userBId = :userId", {
        userId,
      })
      .orderBy("conversation.lastMessageAt", "DESC", "NULLS LAST")
      .addOrderBy("conversation.created_at", "DESC")
      .getMany();
  }
}
