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

	/** Uso administrativo: lista todas as conversas de apoio, com o utilizador. */
	async findAllPaginatedForAdmin(
		page: number,
		pageSize: number,
	): Promise<{ items: SupportConversation[]; total: number }> {
		const [items, total] = await this.repo.findAndCount({
			relations: ["user"],
			order: { updatedAt: "DESC" },
			take: pageSize,
			skip: (page - 1) * pageSize,
		})
		return { items, total }
	}

	/** Uso administrativo: vê a conversa completa (sem restrição de dono). */
	async findByIdForAdmin(id: string): Promise<SupportConversation | null> {
		return await this.repo.findOne({
			where: { id },
			relations: ["user", "messages"],
		})
	}

	/** Uso administrativo: nº de conversas com pelo menos uma mensagem de crise. */
	async countWithCrisis(): Promise<number> {
		const result = await this.repo
			.createQueryBuilder("conversation")
			.innerJoin("conversation.messages", "message", "message.isCrisis = true")
			.select("COUNT(DISTINCT conversation.id)", "count")
			.getRawOne()
		return parseInt(result?.count || "0", 10)
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

	/** Uso administrativo: entre as conversas dadas, quais têm alguma mensagem de crise. */
	async findConversationIdsWithCrisis(conversationIds: string[]): Promise<Set<string>> {
		if (conversationIds.length === 0) return new Set()
		const rows = await this.repo
			.createQueryBuilder("message")
			.select("DISTINCT message.conversationId", "conversationId")
			.where("message.conversationId IN (:...conversationIds)", { conversationIds })
			.andWhere("message.isCrisis = true")
			.getRawMany()
		return new Set(rows.map((r) => r.conversationId))
	}
}
