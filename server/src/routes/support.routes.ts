import { Router } from "express"
import { authMiddleware } from "../middleware/auth.middleware"
import supportController from "../controllers/support.controller"

const router = Router()

/**
 * @swagger
 * tags:
 *   - name: Apoio Emocional
 *     description: Chat de apoio emocional com IA (Gemini). Todas as rotas requerem autenticação.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SupportMessageItem:
 *       type: object
 *       required:
 *         - role
 *         - content
 *       properties:
 *         role:
 *           type: string
 *           enum: [user, assistant]
 *           example: user
 *         content:
 *           type: string
 *           example: "Hoje estou a sentir-me muito sozinho."
 *
 *     SendSupportMessageInput:
 *       type: object
 *       required:
 *         - messages
 *       properties:
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SupportMessageItem'
 *           minItems: 1
 *
 *     SupportHistoryMessage:
 *       type: object
 *       properties:
 *         role:
 *           type: string
 *           enum: [user, assistant]
 *         content:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     SupportHistory:
 *       type: object
 *       properties:
 *         conversationId:
 *           type: string
 *           format: uuid
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SupportHistoryMessage'
 */

/**
 * @swagger
 * /support/chat:
 *   post:
 *     summary: Enviar mensagens e receber resposta da IA em streaming
 *     description: >
 *       Aceita o histórico de mensagens da conversa e devolve a resposta
 *       do assistente como `text/plain` em chunked transfer encoding (streaming).
 *       Mensagens que ativam padrões de crise recebem uma resposta de segurança
 *       pré-definida e não passam pelo Gemini.
 *     tags: [Apoio Emocional]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendSupportMessageInput'
 *     responses:
 *       200:
 *         description: Resposta da IA em streaming (text/plain)
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       429:
 *         description: Limite de mensagens por hora atingido
 *       500:
 *         description: Erro interno do servidor
 *       502:
 *         description: Erro ao comunicar com a IA
 */
router.post("/chat", authMiddleware, supportController.chat)

/**
 * @swagger
 * /support/history:
 *   get:
 *     summary: Obter histórico da conversa activa
 *     tags: [Apoio Emocional]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Histórico da conversa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupportHistory'
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Nenhuma conversa activa
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/history", authMiddleware, supportController.history)

/**
 * @swagger
 * /support/conversation:
 *   delete:
 *     summary: Encerrar a conversa activa (reset)
 *     description: Fecha a conversa activa do utilizador. Uma nova conversa será criada automaticamente no próximo envio.
 *     tags: [Apoio Emocional]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Conversa encerrada com sucesso
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/conversation", authMiddleware, supportController.closeConversation)

export default router
