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
import { AnswerReaction } from "./answer-reaction.entity";

@Entity()
export class Answer {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  text!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Comment, { onDelete: "CASCADE" })
  comment!: Comment;

  @ManyToOne(() => User)
  user!: User;

  @Column({
    type: "enum",
    enum: ["active", "deleted", "flagged", "edited"],
    default: "active",
  })
  status!: "active" | "deleted" | "flagged" | "edited";

  @Column({ default: 0 })
  likes_count!: number;

  @Column({ default: 0 })
  dislikes_count!: number;

  @OneToMany(() => AnswerReaction, (reaction) => reaction.answer)
  reactions!: AnswerReaction[];
}
