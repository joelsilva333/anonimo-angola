import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import reportController from "../controllers/report.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Reports
 *     description: Endpoints para denunciar desabafos, comentários e respostas
 */

/**
 * @swagger
 * /reports/{targetType}/{targetId}:
 *   post:
 *     summary: Denunciar um desabafo, comentário ou resposta
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [post, comment, answer]
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *               details:
 *                 type: string
 *     responses:
 *       201:
 *         description: Denúncia registada com sucesso
 *       400:
 *         description: Erro de validação ou conteúdo inexistente
 *       401:
 *         description: Token inválido ou não fornecido
 */
router.post("/:targetType/:targetId", authMiddleware, reportController.create);

export default router;
