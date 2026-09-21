import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";
import adminController from "../controllers/admin.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Painel administrativo — estatísticas, gestão de utilizadores e denúncias. Todos os endpoints exigem role="admin".
 */

router.use(authMiddleware, adminMiddleware);

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Estatísticas gerais da plataforma
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contagens de utilizadores, posts, denúncias e violações
 *       403:
 *         description: Acesso restrito a administradores
 */
router.get("/stats", adminController.getStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Lista utilizadores (paginada, com pesquisa e filtro por estado)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, suspended]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista paginada de utilizadores
 */
router.get("/users", adminController.listUsers);

/**
 * @swagger
 * /admin/users/{id}/violations:
 *   get:
 *     summary: Histórico de violações de moderação de um utilizador
 *     tags: [Admin]
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
 *       200:
 *         description: Lista de violações
 */
router.get("/users/:id/violations", adminController.getUserViolations);

/**
 * @swagger
 * /admin/users/{id}/ban:
 *   post:
 *     summary: Suspende manualmente uma conta
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Conta suspensa
 *       400:
 *         description: Erro (ex. tentar suspender outro admin)
 */
router.post("/users/:id/ban", adminController.banUser);

/**
 * @swagger
 * /admin/users/{id}/unban:
 *   post:
 *     summary: Reactiva uma conta suspensa
 *     tags: [Admin]
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
 *       200:
 *         description: Conta reactivada
 */
router.post("/users/:id/unban", adminController.unbanUser);

/**
 * @swagger
 * /admin/violations:
 *   get:
 *     summary: Lista todas as violações de moderação (paginada)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista paginada de violações
 */
router.get("/violations", adminController.listViolations);

/**
 * @swagger
 * /admin/reports:
 *   get:
 *     summary: Lista denúncias (paginada, com filtro por estado)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, resolved, dismissed]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista paginada de denúncias, com pré-visualização do conteúdo denunciado
 */
router.get("/reports", adminController.listReports);

/**
 * @swagger
 * /admin/reports/{id}:
 *   patch:
 *     summary: Resolve ou dispensa uma denúncia
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [resolved, dismissed]
 *               deleteContent:
 *                 type: boolean
 *                 description: Se true e action="resolved", apaga também o conteúdo denunciado.
 *     responses:
 *       200:
 *         description: Denúncia actualizada
 */
router.patch("/reports/:id", adminController.resolveReport);

export default router;
