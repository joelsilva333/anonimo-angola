export interface ShareResponse {
  message: string;
  share: {
    id: string;
    postId: string;
    platform: string;
    shareToken: string;
    userId: string;
    created_at: string;
  };
  shareLinks: {
    rawLink: string;
    facebook: string;
    linkedin: string;
    whatsapp: string;
    instagram: string;
  };
}