import { plainToInstance } from "class-transformer"
import { validate } from "class-validator"
import { Request, Response } from "express"
import { SendSupportMessageDTO } from "../dto/support.dto"
import { SupportService } from "../service/support.service"

class SupportController {
	private supportService: SupportService

	constructor() {
		this.supportService = new SupportService()
	}

	/**
	 * POST /api/support/chat
	 * Envia mensagens e faz streaming da resposta da IA.
	 */
	chat = async (req: Request, res: Response): Promise<void> => {
		try {
			const { id: userId } = req.anon_name

			const dto = plainToInstance(SendSupportMessageDTO, req.body)
			const errors = await validate(dto)

			if (errors.length > 0) {
				res.status(400).json({
					error: "Erro de validação",
					details: errors.map((e) => ({
						property: e.property,
						constraints: e.constraints,
					})),
				})
				return
			}

			await this.supportService.sendMessage(userId, dto.messages, res)
		} catch (err) {
			console.error("[SupportController] Erro no chat:", err)
			if (!res.headersSent) {
				res.status(500).json({ error: "Erro interno do servidor." })
			}
		}
	}

	/**
	 * GET /api/support/history
	 * Devolve o histórico da conversa activa do utilizador.
	 */
	history = async (req: Request, res: Response): Promise<Response> => {
		try {
			const { id: userId } = req.anon_name
			const data = await this.supportService.getHistory(userId)

			if (!data) {
				return res.status(404).json({ error: "Nenhuma conversa activa encontrada." })
			}

			return res.status(200).json(data)
		} catch (err) {
			console.error("[SupportController] Erro no histórico:", err)
			return res.status(500).json({ error: "Erro interno do servidor." })
		}
	}

	/**
	 * DELETE /api/support/conversation
	 * Encerra a conversa activa (equivalente ao "reset" do frontend).
	 */
	closeConversation = async (req: Request, res: Response): Promise<Response> => {
		try {
			const { id: userId } = req.anon_name
			await this.supportService.closeActiveConversation(userId)
			return res.status(204).send()
		} catch (err) {
			console.error("[SupportController] Erro ao fechar conversa:", err)
			return res.status(500).json({ error: "Erro interno do servidor." })
		}
	}
}

export default new SupportController()
