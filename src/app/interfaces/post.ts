export interface PostInterface {
  id: string;
  anon_name: string;
  text: string;
  created_at: Date;
  updated_at: Date;
  status: "active" | "flagged" | "deleted";
}
