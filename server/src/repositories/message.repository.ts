import { Repository } from "typeorm";
import AppDataSource from "../database/connection";
import { Message } from "../entities/message.entity";

export class MessageRepository {
  private repository: Repository<Message>;

  constructor() {
    this.repository = AppDataSource.getRepository(Message);
  }

  async save(message: Message): Promise<Message> {
    return this.repository.save(message);
  }

  async findByConversation(
    conversationId: string,
    limit: number,
    offset: number,
  ): Promise<{ items: Message[]; total: number }> {
    const [items, total] = await this.repository.findAndCount({
      where: { conversationId },
      relations: ["sender"],
      order: { created_at: "DESC" },
      take: limit,
      skip: offset,
    });
    return { items, total };
  }

  async findLastForConversation(conversationId: string): Promise<Message | null> {
    return this.repository.findOne({
      where: { conversationId },
      order: { created_at: "DESC" },
    });
  }

  async countUnread(conversationId: string, recipientId: string): Promise<number> {
    return this.repository
      .createQueryBuilder("message")
      .where("message.conversationId = :conversationId", { conversationId })
      .andWhere("message.senderId != :recipientId", { recipientId })
      .andWhere("message.isRead = false")
      .getCount();
  }

  async markConversationAsRead(
    conversationId: string,
    recipientId: string,
  ): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where("conversationId = :conversationId", { conversationId })
      .andWhere("senderId != :recipientId", { recipientId })
      .andWhere("isRead = false")
      .execute();
  }
}
