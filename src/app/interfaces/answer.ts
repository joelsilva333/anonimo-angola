export interface AnswerInterface {
  id: string;
  userId: string;
  anon_name: string;
  profile_picture: string;
  text: string;
  created_at: Date;
  updated_at: Date;
  status: "active" | "flagged" | "deleted"
}
