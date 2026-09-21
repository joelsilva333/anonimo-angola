import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { User } from "./user.entity";
import { Answer } from "./answer.entity";
import { ReactionType } from "./reaction.enum";

@Entity()
@Unique(["user", "answer"])
export class AnswerReaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "enum",
    enum: ReactionType,
  })
  type!: ReactionType;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Answer, { onDelete: "CASCADE" })
  answer!: Answer;

  @CreateDateColumn()
  created_at!: Date;
}