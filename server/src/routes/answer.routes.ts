import answerController from "../controllers/answer.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { Router } from "express";

const routes = Router();

/**
 * @swagger
 * tags:
 *   - name: Answers
 *     description: Respostas a comentários (nível mais profundo da conversa)
 */

/**
 * @swagger
 * /answers/{id}:
 *   post:
 *     summary: Responder a um comentário
 *     description: >
 *       O texto passa pelo filtro de palavrões e por uma barreira de
 *       moderação por IA (Gemini) contra discurso de ódio, assédio ou
 *       doxxing antes de ser publicado.
 *     tags:
 *       - Answers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do comentário a responder
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
 *     responses:
 *       '201':
 *         description: Resposta criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 answer:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     text:
 *                       type: string
 *                     profile_picture:
 *                       type: string
 *                     anon_name:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         description: Não autenticado
 *       '422':
 *         description: Bloqueado pela moderação de IA (discurso de ódio, assédio ou doxxing)
 *       '500':
 *         description: Erro interno do servidor
 */
routes.post("/:id", authMiddleware, answerController.create);

/**
 * @swagger
 * /answers/{id}:
 *   put:
 *     summary: Editar uma resposta
 *     tags:
 *       - Answers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da resposta
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
 *     responses:
 *       '200':
 *         description: Resposta atualizada com sucesso
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         description: Não autenticado
 *       '422':
 *         description: Bloqueado pela moderação de IA
 *       '500':
 *         description: Erro interno do servidor
 */
routes.put("/:id", authMiddleware, answerController.update);

/**
 * @swagger
 * /answers/{id}:
 *   delete:
 *     summary: Apagar uma resposta (apenas o autor)
 *     tags:
 *       - Answers
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
 *         description: Resposta deletada com sucesso
 *       '401':
 *         description: Não autenticado
 *       '500':
 *         description: Erro interno do servidor (inclui tentar apagar resposta de outro utilizador)
 */
routes.delete("/:id", authMiddleware, answerController.delete);

export default routes;
