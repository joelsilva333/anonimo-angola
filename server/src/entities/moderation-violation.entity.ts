import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ModerationCategory } from "../service/ai.service";

export type ViolationContentType = "post" | "comment" | "answer" | "message";

/**
 * Regista cada vez que a IA bloqueia uma tentativa de publicação (post,
 * comentário, resposta ou mensagem). Usado só para detectar uso indevido
 * repetido — nunca guarda o texto bloqueado, apenas a categoria/motivo.
 */
@Entity("moderation_violation")
export class ModerationViolation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  @Index()
  userId!: string;

  @Column({ type: "varchar" })
  contentType!: ViolationContentType;

  @Column({ type: "varchar" })
  category!: ModerationCategory;

  @Column({ type: "text", nullable: true })
  reason!: string | null;

  @CreateDateColumn()
  created_at!: Date;
}
