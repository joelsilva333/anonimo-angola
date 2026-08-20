import { PostCommentInterface } from "./comments";
import UserInterface from "./user";

export interface PostInterface {
  id: string;
  user_id: string;
  anon_name: string;
  user: UserInterface;
  profile_picture?: string;
  text: string;
  like: number;
  dislike: number;
  has_reacted: boolean | null;
  reaction_type: "like" | "dislike" | null;
  created_at: Date;
  updated_at: Date;
  status: "active" | "flagged" | "deleted";
  comments: PostCommentInterface[];
  /** Rótulo curto de humor gerado pela IA (uso privado no diário emocional do autor). */
  mood_label?: string | null;
  /** Sinal de crise emocional/ideação suicida detectado pela IA neste desabafo. */
  ai_crisis_detected?: boolean;
  /** Temas/sentimentos identificados pela IA (usados no matching por afinidade). */
  theme_tags?: string[];
}
