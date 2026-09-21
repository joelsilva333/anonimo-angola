import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import messageController from "../controllers/message.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Messages
 *     description: >
 *       Mensagens privadas entre utilizadores. Só é possível conversar com
 *       alguém com quem já tenha havido interação pública (seguir, comentar
 *       ou responder) — evita contacto não solicitado de desconhecidos.
 *       Cada mensagem passa pela mesma barreira de moderação por IA usada
 *       em posts/comentários. Entregues em tempo real via Socket.io
 *       (evento "message"), quando disponível.
 */

/**
 * @swagger
 * /messages/{userId}:
 *   post:
 *     summary: Enviar uma mensagem privada (cria a conversa se ainda não existir)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID do destinatário
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 maxLength: 2000
 *     responses:
 *       '201':
 *         description: Mensagem enviada com sucesso
 *       '400':
 *         description: >
 *           Erro de validação, destinatário inexistente, ou sem interação
 *           prévia (não é possível iniciar conversa com desconhecidos)
 *       '401':
 *         description: Não autenticado
 *       '422':
 *         description: Bloqueada pela moderação de IA
 */
router.post("/:userId", authMiddleware, messageController.send);

/**
 * @swagger
 * /messages/conversations:
 *   get:
 *     summary: Listar as conversas do utilizador autenticado
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de conversas, mais recente primeiro, com a última mensagem e contagem de não lidas
 *       '401':
 *         description: Não autenticado
 */
router.get(
  "/conversations",
  authMiddleware,
  messageController.getConversations,
);

/**
 * @swagger
 * /messages/conversations/{id}:
 *   get:
 *     summary: Obter o histórico de mensagens de uma conversa (paginado)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 30
 *           maximum: 100
 *     responses:
 *       '200':
 *         description: Mensagens da conversa, da mais antiga para a mais recente
 *       '400':
 *         description: Conversa não encontrada, ou utilizador não é participante
 *       '401':
 *         description: Não autenticado
 */
router.get(
  "/conversations/:id",
  authMiddleware,
  messageController.getMessages,
);

/**
 * @swagger
 * /messages/conversations/{id}/read:
 *   patch:
 *     summary: Marcar todas as mensagens recebidas de uma conversa como lidas
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Conversa marcada como lida
 *       '400':
 *         description: Conversa não encontrada, ou utilizador não é participante
 *       '401':
 *         description: Não autenticado
 */
router.patch(
  "/conversations/:id/read",
  authMiddleware,
  messageController.markAsRead,
);

export default router;
