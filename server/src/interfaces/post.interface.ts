import { UserInterface } from "./user.interface";

export interface PostInterface {
  id: string;
  user: UserInterface;
  text: string;
  like: number;
  dislike: number;
  created_at: Date;
  updated_at?: Date;
  status: "active" | "deleted" | "flagged";
}
