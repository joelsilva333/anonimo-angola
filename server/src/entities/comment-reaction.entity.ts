import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { User } from "./user.entity";
import { Comment } from "./comment.entity";
import { ReactionType } from "./reaction.enum";

@Entity()
@Unique(["user", "comment"])
export class CommentReaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "enum",
    enum: ReactionType,
  })
  type!: ReactionType;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Comment, { onDelete: "CASCADE" })
  comment!: Comment;

  @CreateDateColumn()
  created_at!: Date;
}