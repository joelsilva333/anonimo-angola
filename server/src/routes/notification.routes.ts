import { Router } from "express";
import notificationController from "../controllers/notification.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: Notificações de interações (curtidas, comentários, respostas)
 */

/**
 * @swagger
 * /notification:
 *   get:
 *     summary: Listar as notificações do utilizador autenticado
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de notificações, mais recente primeiro
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   recipientId:
 *                     type: string
 *                   senderId:
 *                     type: string
 *                     nullable: true
 *                   type:
 *                     type: string
 *                     enum: [LIKE, COMMENT, ANSWER, MENTION]
 *                   targetType:
 *                     type: string
 *                     enum: [POST, COMMENT, ANSWER]
 *                   targetId:
 *                     type: string
 *                   isRead:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   sender:
 *                     type: object
 *                     properties:
 *                       anon_name:
 *                         type: string
 *                       profile_picture:
 *                         type: string
 *       '400':
 *         description: Erro ao obter as notificações
 *       '401':
 *         description: Não autenticado
 */
router.get("/", authMiddleware, notificationController.getUserNotifications);

/**
 * @swagger
 * /notification/unread-count:
 *   get:
 *     summary: Obter o número de notificações não lidas
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Contagem de notificações não lidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unreadCount:
 *                   type: integer
 *                   example: 3
 *       '400':
 *         description: Erro ao obter a contagem
 *       '401':
 *         description: Não autenticado
 */
router.get(
  "/unread-count",
  authMiddleware,
  notificationController.getUnreadCount,
);

/**
 * @swagger
 * /notification/{id}/read:
 *   patch:
 *     summary: Marcar uma notificação específica como lida
 *     tags:
 *       - Notifications
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
 *         description: Notificação marcada como lida
 *       '400':
 *         description: Notificação não encontrada ou não pertence ao utilizador
 *       '401':
 *         description: Não autenticado
 */
router.patch("/:id/read", authMiddleware, notificationController.markAsRead);

/**
 * @swagger
 * /notification/read-all:
 *   patch:
 *     summary: Marcar todas as notificações do utilizador como lidas
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Todas as notificações foram marcadas como lidas
 *       '400':
 *         description: Erro ao marcar as notificações
 *       '401':
 *         description: Não autenticado
 */
router.patch("/read-all", authMiddleware, notificationController.markAllAsRead);

export default router;
