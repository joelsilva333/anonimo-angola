import { Notification } from "../entities/notification.entity";
import { CreateNotificationDto } from "../dto/notification.dto";
import { NotificationRepository } from "../repositories/notification.repository";
import { getIO } from "../socket";

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  async sendNotification(
    dto: CreateNotificationDto,
  ): Promise<Notification | null> {
    if (dto.senderId === dto.recipientId) {
      return null;
    }

    const notification = await this.notificationRepository.create(dto);

    // Em tempo real, se o Socket.io estiver ligado (não está no handler
    // serverless da Vercel, só no arranque tradicional local/Render).
    getIO()?.to(dto.recipientId).emit("notification", notification);

    return notification;
  }

  async getMyNotifications(userId: string): Promise<Notification[]> {
    return await this.notificationRepository.findByRecipient(userId);
  }

  async getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
    const count = await this.notificationRepository.countUnread(userId);
    return { unreadCount: count };
  }

  async readNotification(id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findById(id);

    if (!notification || notification.recipientId !== userId) {
      throw new Error("Notificação não encontrada ou não autorizada");
    }

    await this.notificationRepository.markAsRead(id);
  }

  async readAllNotifications(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }
}
