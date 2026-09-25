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

@Entity("block")
@Unique(["blockerId", "blockedId"])
export class Block {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  @Index()
  blockerId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "blockerId" })
  blocker!: User;

  @Column({ type: "uuid" })
  @Index()
  blockedId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "blockedId" })
  blocked!: User;

  @CreateDateColumn()
  created_at!: Date;
}
