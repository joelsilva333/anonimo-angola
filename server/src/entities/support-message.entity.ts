import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm"
import { SupportConversation } from "./support-conversation.entity"

export enum MessageRole {
	USER = "user",
	ASSISTANT = "assistant",
}

@Entity("support_messages")
export class SupportMessage {
	@PrimaryGeneratedColumn("uuid")
	id!: string

	@Column({ name: "conversation_id" })
	conversationId!: string

	@ManyToOne(() => SupportConversation, (conv) => conv.messages, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "conversation_id" })
	conversation!: SupportConversation

	@Column({ type: "enum", enum: MessageRole })
	role!: MessageRole

	@Column({ type: "text" })
	content!: string

	/**
	 * true quando a mensagem do utilizador ativou um padrão de crise
	 * (ideação suicida, auto-agressão, etc.). Nunca é definido para
	 * mensagens do assistente.
	 */
	@Column({ name: "is_crisis", default: false })
	isCrisis!: boolean

	@CreateDateColumn({ name: "created_at" })
	createdAt!: Date
}
