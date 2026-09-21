import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm"
import { User } from "./user.entity"
import { SupportMessage } from "./support-message.entity"

export enum ConversationStatus {
	ACTIVE = "active",
	CLOSED = "closed",
}

@Entity("support_conversations")
export class SupportConversation {
	@PrimaryGeneratedColumn("uuid")
	id!: string

	@Column({ name: "user_id" })
	userId!: string

	@ManyToOne(() => User, { onDelete: "CASCADE" })
	@JoinColumn({ name: "user_id" })
	user!: User

	@Column({
		type: "enum",
		enum: ConversationStatus,
		default: ConversationStatus.ACTIVE,
	})
	status!: ConversationStatus

	@OneToMany(() => SupportMessage, (message) => message.conversation, {
		cascade: true,
	})
	messages!: SupportMessage[]

	@CreateDateColumn({ name: "created_at" })
	createdAt!: Date

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt!: Date
}
