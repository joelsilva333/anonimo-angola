import { Router } from "express";
import { ReactionController } from "../controllers/reaction.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const reactionController = new ReactionController();

/**
 * @swagger
 * tags:
 *   - name: Reações
 *     description: Endpoints para gerenciamento de reações (like/dislike) em posts, comentários e respostas
 */

/**
 * @swagger
 * /reactions/post/{id}:
 *   post:
 *     summary: Reagir a uma publicação (alterna a reação existente)
 *     description: >
 *       Se o utilizador já tiver qualquer reação neste post, ela é
 *       removida (a reação não é "trocada" para o novo tipo, apenas
 *       alternada). Caso contrário, cria-se uma nova reação com o `type`
 *       enviado.
 *     tags:
 *       - Reações
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da publicação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [like, dislike]
 *     responses:
 *       200:
 *         description: Reação alternada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reacted:
 *                   type: boolean
 *                   description: true se a reação foi criada, false se foi removida
 *                 message:
 *                   type: string
 *       400:
 *         description: ID em falta ou tipo de reação inválido
 *       401:
 *         description: Token inválido ou não fornecido
 *       500:
 *         description: Erro interno do servidor — inclui publicação não encontrada
 */
router.post("/post/:id", authMiddleware, reactionController.reactToPost);

/**
 * @swagger
 * /reactions/comment/{id}:
 *   post:
 *     summary: Reagir a um comentário (alterna a reação existente)
 *     description: >
 *       Mesma regra do endpoint de posts: uma reação já existente é
 *       removida; caso contrário cria-se uma nova com o `type` enviado.
 *     tags:
 *       - Reações
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do comentário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [like, dislike]
 *     responses:
 *       200:
 *         description: Reação alternada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reacted:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: ID em falta ou tipo de reação inválido
 *       401:
 *         description: Token inválido ou não fornecido
 *       500:
 *         description: Erro interno do servidor — inclui comentário não encontrado
 */
router.post("/comment/:id", authMiddleware, reactionController.reactToComment);

/**
 * @swagger
 * /reactions/answer/{id}:
 *   post:
 *     summary: Reagir a uma resposta (alterna a reação existente)
 *     description: >
 *       Mesma regra dos outros endpoints de reação: uma reação já existente
 *       é removida; caso contrário cria-se uma nova com o `type` enviado.
 *     tags:
 *       - Reações
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da resposta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [like, dislike]
 *     responses:
 *       200:
 *         description: Reação alternada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reacted:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: ID em falta ou tipo de reação inválido
 *       401:
 *         description: Token inválido ou não fornecido
 *       500:
 *         description: Erro interno do servidor — inclui resposta não encontrada
 */
router.post("/answer/:id", authMiddleware, reactionController.reactToAnswer);

export default router;
