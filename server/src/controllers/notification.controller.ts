import { Request, Response } from "express";
import { NotificationService } from "../service/notification.service";

class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  getUserNotifications = async (req: Request, res: Response): Promise<any> => {
    try {
      const { id: userId } = req.anon_name;
      const notifications =
        await this.notificationService.getMyNotifications(userId);

      return res.status(200).json(
        notifications.map((notification) => ({
          id: notification.id,
          recipientId: notification.recipientId,
          senderId: notification.senderId,
          type: notification.type,
          targetType: notification.targetType,
          targetId: notification.targetId,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
          sender: {
            anon_name: notification.sender.anon_name,
            profile_picture: notification.sender.profile_picture,
          },
        })),
      );
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };

  getUnreadCount = async (req: Request, res: Response): Promise<any> => {
    try {
      const { id: userId } = req.anon_name;
      const result = await this.notificationService.getUnreadCount(userId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };

  markAsRead = async (req: Request, res: Response): Promise<any> => {
    try {
      const { id: userId } = req.anon_name;
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      await this.notificationService.readNotification(id, userId);
      return res
        .status(200)
        .json({ message: "Notificação marcada como lida." });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };

  markAllAsRead = async (req: Request, res: Response): Promise<any> => {
    try {
      const { id: userId } = req.anon_name;
      await this.notificationService.readAllNotifications(userId);
      return res
        .status(200)
        .json({ message: "Todas as notificações foram marcadas como lidas." });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };
}

export default new NotificationController();
