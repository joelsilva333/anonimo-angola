import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { User } from "./user.entity";

/**
 * Conversa privada entre dois utilizadores. `userAId`/`userBId` são sempre
 * guardados ordenados (o menor primeiro) para que exista sempre no máximo
 * uma conversa entre o mesmo par de pessoas, independentemente de quem a
 * iniciou.
 */
@Entity("conversation")
@Unique(["userAId", "userBId"])
export class Conversation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  @Index()
  userAId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userAId" })
  userA!: User;

  @Column({ type: "uuid" })
  @Index()
  userBId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userBId" })
  userB!: User;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ type: "timestamp", nullable: true })
  lastMessageAt!: Date | null;
}
