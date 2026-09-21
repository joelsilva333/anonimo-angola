export interface ConversationInterface {
  id: string;
  user: {
    id: string;
    anon_name: string;
    profile_picture: string;
  };
  lastMessage: {
    text: string;
    created_at: string;
    senderId: string;
  } | null;
  unreadCount: number;
}

export interface DirectMessageInterface {
  id: string;
  conversationId?: string;
  senderId: string;
  text: string;
  created_at: string;
  isRead?: boolean;
  sender: {
    anon_name: string;
    profile_picture: string;
  };
}
