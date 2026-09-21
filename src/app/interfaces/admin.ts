export interface AdminStats {
  users: {
    total: number;
    active: number;
    suspended: number;
    newLast7Days: number;
  };
  posts: {
    total: number;
    flagged: number;
    crisisDetected: number;
    newLast7Days: number;
  };
  reports: {
    pending: number;
    resolved: number;
    dismissed: number;
  };
  violations: {
    total: number;
  };
  support: {
    crisisConversations: number;
  };
}

export interface AdminUser {
  id: string;
  anon_name: string;
  profile_picture: string;
  role: string;
  is_active: boolean;
  banned_reason: string | null;
  banned_at: string | null;
  created_at: string;
  last_login_at: string | null;
}

export interface AdminViolation {
  id: string;
  userId: string;
  anon_name: string;
  contentType: "post" | "comment" | "answer" | "message";
  category: string;
  reason: string | null;
  created_at: string;
}

export type AdminReportStatus = "pending" | "resolved" | "dismissed";

export interface AdminReport {
  id: string;
  reason: string;
  details: string | null;
  status: AdminReportStatus;
  target_type: "post" | "comment" | "answer";
  target_id: string;
  created_at: string;
  resolved_at: string | null;
  reporter: {
    id: string;
    anon_name: string;
  };
  target: {
    text: string;
    authorAnonName: string | null;
  } | null;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminSupportConversation {
  id: string;
  status: "active" | "closed";
  anon_name: string;
  userId: string;
  hasCrisis: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSupportMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isCrisis: boolean;
  createdAt: string;
}

export interface AdminSupportConversationDetail {
  id: string;
  status: "active" | "closed";
  anon_name: string;
  messages: AdminSupportMessage[];
}
