import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Post } from "./post.entity";
import { User } from "./user.entity";

@Entity("post_shares")
export class PostShare {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  postId!: string;

  @ManyToOne(() => Post, { onDelete: "CASCADE" })
  @JoinColumn({ name: "postId" })
  post!: Post;

  // Opcional: Se for nulo, significa que foi uma partilha feita por um visitante não autenticado
  @Column({ type: "uuid", nullable: true })
  userId!: string | null;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "userId" })
  user!: User | null;

  @Column({ type: "varchar", length: 50, default: "link" })
  platform!: string; 

  @Column({ type: "varchar", unique: true })
  shareToken!: string;

  @CreateDateColumn()
  created_at!: Date;
}   