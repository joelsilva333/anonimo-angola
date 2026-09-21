import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Comment } from "./comment.entity";
import { PostReaction } from "./post-reaction.entity";

@Entity()
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  text!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user!: User;

  @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
  comments!: Comment[];

  @Column({
    type: "enum",
    enum: ["active", "deleted", "flagged", "edited"],
    default: "active",
  })
  status!: "active" | "deleted" | "flagged";

  @Column({ default: 0 })
  likes_count!: number;

  @Column({ default: 0 })
  dislikes_count!: number;

  @OneToMany(() => PostReaction, (reaction) => reaction.post)
  reactions!: PostReaction[];

  /** Rótulo curto de humor gerado pela IA (Gemini), usado no diário emocional privado do autor. */
  @Column({ type: "varchar", nullable: true })
  mood_label!: string | null;

  /** Indica se a IA detectou sinais sérios de crise emocional/ideação suicida neste desabafo. */
  @Column({ default: false })
  ai_crisis_detected!: boolean;

  /** Temas/sentimentos identificados pela IA, usados como apoio ao matching por afinidade. */
  @Column({ type: "simple-array", nullable: true })
  theme_tags!: string[] | null;

  /** Vector de embedding (Gemini text-embedding-004) usado para encontrar relatos semelhantes. */
  @Column({ type: "jsonb", nullable: true })
  embedding!: number[] | null;
}
