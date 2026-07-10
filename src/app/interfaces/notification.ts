export interface NotificationInterface {
  id: string;
  recipientId: string;
  senderId: string;
  type: string;
  targetType: string;
  targetId: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    anon_name: string;
    profile_picture: string;
  };
}
