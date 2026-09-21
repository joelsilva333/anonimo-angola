import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import aiController from "../controllers/ai.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: IA
 *     description: Funcionalidades gerais de Inteligência Artificial (Gemini)
 */

/**
 * @swagger
 * /ai/mood-tracker:
 *   get:
 *     summary: Diário Emocional / Mood Tracker privado
 *     description: >
 *       Analisa o histórico recente de desabafos do utilizador autenticado
 *       (usando apenas os rótulos de humor já gerados na criação de cada
 *       post, nunca o texto original) e devolve uma tendência de humor com
 *       sugestões leves de autocuidado geradas pela IA.
 *     tags: [IA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Evolução de humor e sugestões (baseado nos últimos 20 posts não apagados)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timeline:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       mood:
 *                         type: string
 *                         example: "Ansioso"
 *                 moodCounts:
 *                   type: object
 *                   description: Contagem de posts por rótulo de humor
 *                   additionalProperties:
 *                     type: integer
 *                   example: { "Ansioso": 3, "Grato": 1 }
 *                 summary:
 *                   type: string
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/mood-tracker", authMiddleware, aiController.moodTracker);

export default router;
