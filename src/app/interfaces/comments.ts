import { AnswerInterface } from "./answer";

export interface CommentInterface {
  id: string;
  postId: string;
  postUserId: string;
  userId: string;
  anon_name: string;
  profile_picture: string;
  text: string;
  like: number;
  dislike: number;
  has_reacted: boolean | null;
  reaction_type: "like" | "dislike" | null;
  created_at: Date;
  updated_at: Date;
}

export interface PostCommentInterface {
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
  answers: AnswerInterface[];
  /** Marca este comentário como a primeira resposta gerada automaticamente pela IA (Gemini). */
  is_ai_welcome?: boolean;
}
