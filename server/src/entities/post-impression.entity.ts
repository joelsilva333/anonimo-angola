import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";

/**
 * Regista que um utilizador já viu um post no feed, para o algoritmo poder
 * penalizar (não excluir — continua acessível, ex.: no perfil) posts
 * repetidos e dar espaço a conteúdo novo.
 */
@Entity("post_impression")
@Unique(["userId", "postId"])
export class PostImpression {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  @Index()
  userId!: string;

  @Column({ type: "uuid" })
  @Index()
  postId!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
