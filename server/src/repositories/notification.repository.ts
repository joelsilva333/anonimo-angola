import AppDataSource from "../database/connection";
import { Notification } from "../entities/notification.entity";
import { Repository } from "typeorm";

export class NotificationRepository {
  private notificationRepository: Repository<Notification>;

  constructor() {
    this.notificationRepository = AppDataSource.getRepository(Notification);
  }

  async create(data: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepository.create(data);
    return await this.notificationRepository.save(notification);
  }

  async findByRecipient(recipientId: string): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { recipientId },
      relations: ["sender"],
      order: { createdAt: "DESC" },
    });
  }

  async findById(id: string): Promise<Notification | null> {
    return await this.notificationRepository.findOne({ where: { id } });
  }

  async markAsRead(id: string): Promise<void> {
    await this.notificationRepository.update(id, { isRead: true });
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    await this.notificationRepository.update(
      { recipientId, isRead: false },
      { isRead: true },
    );
  }

  async countUnread(recipientId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { recipientId, isRead: false },
    });
  }
}
