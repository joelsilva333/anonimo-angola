import { Notification, NotificationType, TargetType } from "../entities/notification.entity";
import { CreateNotificationDto } from "../dto/notification.dto";
import { NotificationRepository } from "../repositories/notification.repository";
import { UserRepository } from "../repositories/user.repository";
import { getIO } from "../socket";

/** Mapeia cada tipo de notificação para a preferência do utilizador que a controla. */
const PREFERENCE_BY_TYPE: Partial<Record<NotificationType, "notify_likes" | "notify_comments" | "notify_follows">> = {
  [NotificationType.LIKE]: "notify_likes",
  [NotificationType.COMMENT]: "notify_comments",
  [NotificationType.ANSWER]: "notify_comments",
  [NotificationType.FOLLOW]: "notify_follows",
};

export class NotificationService {
  private notificationRepository: NotificationRepository;
  private userRepository: UserRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
    this.userRepository = new UserRepository();
  }

  async sendNotification(
    dto: CreateNotificationDto,
  ): Promise<Notification | null> {
    if (dto.senderId === dto.recipientId) {
      return null;
    }

    const preferenceField = PREFERENCE_BY_TYPE[dto.type];
    if (preferenceField) {
      const recipient = await this.userRepository.findById(dto.recipientId);
      if (recipient && recipient[preferenceField] === false) {
        return null;
      }
    }

    const notification = await this.notificationRepository.create(dto);

    // Em tempo real, se o Socket.io estiver ligado (não está no handler
    // serverless da Vercel, só no arranque tradicional local/Render).
    getIO()?.to(dto.recipientId).emit("notification", notification);

    return notification;
  }

  /**
   * Avisa todos os administradores (role="admin") sobre um evento que exige
   * atenção — nova denúncia, suspensão automática, conversa de apoio com
   * sinal de crise. Reutiliza o mesmo sistema de notificações dos
   * utilizadores comuns: os endpoints /notification já funcionam para
   * qualquer recipientId, incluindo o de um admin.
   */
  async notifyAdmins(
    type: NotificationType.ADMIN_REPORT | NotificationType.ADMIN_BAN | NotificationType.ADMIN_CRISIS,
    targetType: TargetType,
    targetId: string,
  ): Promise<void> {
    try {
      const admins = await this.userRepository.findAdmins();
      await Promise.all(
        admins.map((admin) =>
          this.sendNotification({
            recipientId: admin.id,
            type,
            targetType,
            targetId,
          }),
        ),
      );
    } catch (err) {
      console.error("[NotificationService] Falha ao avisar administradores:", err);
    }
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
