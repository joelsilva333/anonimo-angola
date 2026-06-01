export interface AnswerInterface {
  id: string;
  userId: string;
  anon_name: string;
  profile_picture: string;
  text: string;
  created_at: Date;
  updated_at: Date;
  like: number;
  dislike: number;
  has_reacted: boolean | null;
  reaction_type: "like" | "dislike" | null;
  status: "active" | "flagged" | "deleted";
}
