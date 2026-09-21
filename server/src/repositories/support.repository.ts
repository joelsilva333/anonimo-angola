import AppDataSource from "../database/connection"
import { Repository } from "typeorm"
import {
	SupportConversation,
	ConversationStatus,
} from "../entities/support-conversation.entity"
import { SupportMessage, MessageRole } from "../entities/support-message.entity"

export class SupportConversationRepository {
	private repo: Repository<SupportConversation>

	constructor() {
		this.repo = AppDataSource.getRepository(SupportConversation)
	}

	async create(userId: string): Promise<SupportConversation> {
		const conversation = this.repo.create({ userId })
		return await this.repo.save(conversation)
	}

	async findActiveByUserId(userId: string): Promise<SupportConversation | null> {
		return await this.repo.findOne({
			where: { userId, status: ConversationStatus.ACTIVE },
			relations: ["messages"],
			order: { updatedAt: "DESC" },
		})
	}

	async findByIdAndUserId(
		id: string,
		userId: string,
	): Promise<SupportConversation | null> {
		return await this.repo.findOne({
			where: { id, userId },
			relations: ["messages"],
		})
	}

	async findAllByUserId(userId: string): Promise<SupportConversation[]> {
		return await this.repo.find({
			where: { userId },
			order: { updatedAt: "DESC" },
		})
	}

	async close(id: string): Promise<void> {
		await this.repo.update(id, { status: ConversationStatus.CLOSED })
	}

	async touch(id: string): Promise<void> {
		await this.repo.update(id, { updatedAt: new Date() })
	}
}

export class SupportMessageRepository {
	private repo: Repository<SupportMessage>

	constructor() {
		this.repo = AppDataSource.getRepository(SupportMessage)
	}

	async createMany(
		messages: Array<{
			conversationId: string
			role: MessageRole
			content: string
			isCrisis?: boolean
		}>,
	): Promise<SupportMessage[]> {
		const entities = messages.map((m) => this.repo.create(m))
		return await this.repo.save(entities)
	}

	async findByConversationId(conversationId: string): Promise<SupportMessage[]> {
		return await this.repo.find({
			where: { conversationId },
			order: { createdAt: "ASC" },
		})
	}
}
