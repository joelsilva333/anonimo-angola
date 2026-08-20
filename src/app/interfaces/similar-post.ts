export interface SimilarPostInterface {
  id: string;
  anon_name: string;
  profile_picture?: string;
  text: string;
  created_at: string;
  theme_tags: string[];
  similarity: number;
}
