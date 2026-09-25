import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./post.entity";
import { User } from "./user.entity";
import { Answer } from "./answer.entity";
import { CommentReaction } from "./comment-reaction.entity";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  text!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: "CASCADE" })
  post!: Post;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user!: User;

  @OneToMany(() => Answer, (answer) => answer.comment, { cascade: true })
  answers!: Answer[];

  @Column({
    type: "enum",
    enum: ["active", "deleted", "flagged", "edited", "removed_by_admin"],
    default: "active",
  })
  status!: "active" | "deleted" | "flagged" | "removed_by_admin";

  @Column({ default: 0 })
  likes_count!: number;

  @Column({ default: 0 })
  dislikes_count!: number;

  @OneToMany(() => CommentReaction, (reaction) => reaction.comment)
  reactions!: CommentReaction[];

  /** Marca este comentário como o "Acolhimento Automático IA" gerado pelo Gemini na criação do post. */
  @Column({ default: false })
  is_ai_welcome!: boolean;
}
