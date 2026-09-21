import commentController from "../controllers/comment.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { Router } from "express";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Endpoints para gerenciamento de comentários
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CommentSummary:
 *       type: object
 *       description: Forma devolvida ao criar/editar um comentário (dentro de `comment`)
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         postId:
 *           type: string
 *           format: uuid
 *         postUserId:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         anon_name:
 *           type: string
 *         profile_picture:
 *           type: string
 *         text:
 *           type: string
 *           example: "Força, vai dar tudo certo!"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     CommentWithAnswers:
 *       type: object
 *       description: Forma devolvida por GET /comments/{id}
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         text:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         userId:
 *           type: string
 *           format: uuid
 *         anon_name:
 *           type: string
 *         profile_picture:
 *           type: string
 *         answer:
 *           type: array
 *           description: Respostas a este comentário (a chave chama-se "answer", no singular, apesar de ser uma lista)
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               text:
 *                 type: string
 *               created_at:
 *                 type: string
 *                 format: date-time
 *               userId:
 *                 type: string
 *                 format: uuid
 *               anon_name:
 *                 type: string
 *               profile_picture:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, deleted, flagged, edited]
 *
 *     CreateCommentInput:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         text:
 *           type: string
 *           example: "Força, vai dar tudo certo!"
 *
 *     UpdateCommentInput:
 *       type: object
 *       description: >
 *         O ID do comentário vai no corpo (commentId), não na URL — este
 *         endpoint não tem parâmetro de rota.
 *       required:
 *         - commentId
 *       properties:
 *         commentId:
 *           type: string
 *           format: uuid
 *         text:
 *           type: string
 *           example: "Comentário atualizado"
 *         status:
 *           type: string
 *           enum: [active, deleted, flagged]
 */

/**
 * @swagger
 * /comments/{id}:
 *   post:
 *     summary: Criar um novo comentário em um post
 *     description: >
 *       O texto passa pelo filtro de palavrões e por uma barreira de
 *       moderação por IA (Gemini) contra discurso de ódio, assédio ou
 *       doxxing antes de ser publicado.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID do post onde será criado o comentário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCommentInput'
 *     responses:
 *       201:
 *         description: Comentário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 comment:
 *                   $ref: '#/components/schemas/CommentSummary'
 *       400:
 *         description: Texto em falta ou erro de validação
 *       401:
 *         description: Não autenticado
 *       422:
 *         description: Bloqueado pela moderação de IA (discurso de ódio, assédio ou doxxing)
 *       500:
 *         description: >
 *           Erro interno do servidor — inclui post ou usuário não
 *           encontrado (o endpoint não distingue com um 404 próprio)
 */

/**
 * @swagger
 * /comments:
 *   put:
 *     summary: Atualizar um comentário (apenas o autor)
 *     description: O ID do comentário vai no corpo do pedido (`commentId`), não na URL.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCommentInput'
 *     responses:
 *       200:
 *         description: Comentário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 comment:
 *                   $ref: '#/components/schemas/CommentSummary'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       422:
 *         description: Bloqueado pela moderação de IA
 *       500:
 *         description: >
 *           Erro interno do servidor — inclui comentário não encontrado e
 *           tentativa de editar comentário de outro utilizador (não são
 *           distinguidos com 404/403 próprios)
 */

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Deletar um comentário (autor do comentário ou dono do post)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID do comentário a ser deletado
 *     responses:
 *       204:
 *         description: Comentário deletado com sucesso
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: >
 *           Erro interno do servidor — inclui comentário não encontrado e
 *           falta de permissão (não são distinguidos com 404/403 próprios)
 */

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Buscar um comentário pelo ID, incluindo as suas respostas
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID do comentário a ser buscado
 *     responses:
 *       200:
 *         description: Comentário encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommentWithAnswers'
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Comentário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

router.post("/:id", authMiddleware, commentController.create);
router.delete("/:id", authMiddleware, commentController.delete);
router.put("/", authMiddleware, commentController.update);
router.get("/:id", authMiddleware, commentController.getById);

export default router;
