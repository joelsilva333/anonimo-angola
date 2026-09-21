import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { User } from "./user.entity";
import { Post } from "./post.entity";
import { ReactionType } from "./reaction.enum";

@Entity()
@Unique(["user", "post"]) // Regra de ouro: 1 reação por usuário por post
export class PostReaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "enum",
    enum: ReactionType,
  })
  type!: ReactionType;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Post, { onDelete: "CASCADE" })
  post!: Post;

  @CreateDateColumn()
  created_at!: Date;
}
