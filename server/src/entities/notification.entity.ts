import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

export enum NotificationType {
  LIKE = "LIKE",
  COMMENT = "COMMENT",
  ANSWER = "ANSWER",
  MENTION = "MENTION",
  FOLLOW = "FOLLOW",
  /** Alertas administrativos — só chegam a utilizadores com role="admin". */
  ADMIN_REPORT = "ADMIN_REPORT",
  ADMIN_BAN = "ADMIN_BAN",
  ADMIN_CRISIS = "ADMIN_CRISIS",
}

export enum TargetType {
  POST = "POST",
  COMMENT = "COMMENT",
  ANSWER = "ANSWER",
  USER = "USER",
  REPORT = "REPORT",
  SUPPORT_CONVERSATION = "SUPPORT_CONVERSATION",
}

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "recipient_id" })
  recipientId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "recipient_id" })
  recipient!: User;

  @Column({ name: "sender_id", nullable: true })
  senderId!: string;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "sender_id" })
  sender!: User;

  @Column({
    type: "enum",
    enum: NotificationType,
  })
  type!: NotificationType;

  @Column({
    type: "enum",
    enum: TargetType,
    name: "target_type",
  })
  targetType!: TargetType;

  @Column({ name: "target_id" })
  targetId!: string;

  @Column({ default: false, name: "is_read" })
  isRead!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
