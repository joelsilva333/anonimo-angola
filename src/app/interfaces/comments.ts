export interface CommentInterface {
  id: string;
  postId: string;
  postUserId: string;
  userId: string;
  anon_name: string;
  profile_picture: string;
  text: string;
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
  status: "active" | "flagged" | "deleted";
}
