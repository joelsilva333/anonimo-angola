import { optionalAuthMiddleware } from "../middleware/optional-auth.middleware";
import postShareController from "../controllers/post-share.controller";
import { Router } from "express";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: PostShares
 *     description: Endpoints para gerenciamento e tracking de partilhas de desabafos
 */

/**
 * @swagger
 * /shares:
 *   post:
 *     summary: Gerar links de partilha e intents para redes sociais
 *     tags:
 *       - PostShares
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - platform
 *             properties:
 *               postId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *                 description: ID do desabafo que se deseja partilhar
 *
 *               platform:
 *                 type: string
 *                 enum:
 *                   - facebook
 *                   - instagram
 *                   - linkedin
 *                   - whatsapp
 *                   - link
 *                 example: "whatsapp"
 *                 description: Plataforma onde o link será distribuído
 *
 *     responses:
 *       201:
 *         description: Links gerados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Link de partilha gerado com sucesso
 *
 *                 share:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *
 *                     postId:
 *                       type: string
 *                       format: uuid
 *
 *                     platform:
 *                       type: string
 *
 *                     shareToken:
 *                       type: string
 *
 *                     userId:
 *                       type: string
 *                       nullable: true
 *
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *
 *                 shareLinks:
 *                   type: object
 *                   properties:
 *                     rawLink:
 *                       type: string
 *                       example: "https://anonimo-angola.vercel.app/posts/uuid?ref=token"
 *
 *                     facebook:
 *                       type: string
 *
 *                     linkedin:
 *                       type: string
 *
 *                     whatsapp:
 *                       type: string
 *
 *       400:
 *         description: Erro de validação nos campos enviados
 *
 *       401:
 *         description: Token inválido ou não fornecido
 *
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/", optionalAuthMiddleware, postShareController.create);

export default router;
