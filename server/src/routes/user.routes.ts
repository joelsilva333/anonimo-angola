import { Router } from "express";
import userController from "../controllers/user.controller";
import followController from "../controllers/follow.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gerenciamento de usuários
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "d93b3e28-56f9-4a92-9d01-5f91b2c3e001"
 *         anon_name:
 *           type: string
 *           example: "Anon123"
 *         phone_number:
 *           type: string
 *           example: "+244923456789"
 *         profile_picture:
 *           type: string
 *           example: "http://localhost:8080/public/avatar.png"
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           example: "user"
 *         is_active:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-08-21T14:15:22.000Z"
 *         last_login_at:
 *           type: string
 *           format: date-time
 *           example: "2025-08-23T10:00:00.000Z"
 *     PublicUser:
 *       type: object
 *       description: >
 *         Forma resumida devolvida por GET /users (apenas admins). Nunca
 *         inclui password_hash nem google_id_hash.
 *       properties:
 *         id:
 *           type: string
 *         anon_name:
 *           type: string
 *         phone_number:
 *           type: string
 *           description: Só presente se quem pede for o dono da conta ou um admin
 *         profile_picture:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         is_active:
 *           type: boolean
 *     UpdateUserInput:
 *       type: object
 *       properties:
 *         anon_name:
 *           type: string
 *           minLength: 5
 *           maxLength: 12
 *           example: "Anon987"
 *         profile_picture:
 *           type: string
 *           maxLength: 255
 *         phone_number:
 *           type: string
 *           maxLength: 15
 *           example: "+244911223344"
 *         password_hash:
 *           type: string
 *           minLength: 6
 *           maxLength: 60
 *           description: Apesar do nome do campo, deve ser enviada a nova palavra-passe em texto simples — o backend faz o hash.
 *           example: "novaSenha@123"
 *         is_active:
 *           type: boolean
 *           description: Só tem efeito quando quem faz o pedido é admin
 *           example: false
 *   responses:
 *     UnauthorizedError:
 *       description: Token JWT inválido ou ausente
 *     ForbiddenError:
 *       description: Autenticado, mas sem permissão para esta ação
 *     ValidationError:
 *       description: Erro de validação no corpo da requisição
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar todos os usuários (apenas admins)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PublicUser'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Buscar um usuário por ID
 *     description: >
 *       O telefone só é devolvido (e desencriptado) se quem pede for o
 *       próprio utilizador ou um admin. Nunca devolve password_hash nem
 *       google_id_hash.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do usuário a ser buscado
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PublicUser'
 *                 - type: object
 *                   properties:
 *                     followersCount:
 *                       type: integer
 *                     followingCount:
 *                       type: integer
 *                     isFollowing:
 *                       type: boolean
 *                       description: true se quem pede já segue este utilizador
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: >
 *           Erro interno do servidor — inclui o caso de utilizador não
 *           encontrado (o endpoint não distingue com um 404 próprio)
 *   put:
 *     summary: Atualizar informações do usuário (dono da conta ou admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do usuário a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserInput'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário atualizado com sucesso"
 *                 user:
 *                   $ref: '#/components/schemas/PublicUser'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Quem faz o pedido não é o dono da conta nem um admin
 *       500:
 *         description: >
 *           Erro interno do servidor — inclui violações de regra de negócio
 *           (nome/telefone já em uso, palavra-passe igual à atual, etc.)
 *   delete:
 *     summary: Apagar um usuário (dono da conta ou admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do usuário a ser deletado
 *     responses:
 *       204:
 *         description: Usuário deletado com sucesso
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Quem faz o pedido não é o dono da conta nem um admin
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /users/phone/{phone_number}:
 *   get:
 *     summary: Buscar um usuário pelo número de telefone
 *     description: >
 *       O telefone é armazenado cifrado; a correspondência é feita a nível
 *       aplicacional após decifrar cada registo (percorre todos os
 *       utilizadores com telefone definido). O telefone só é devolvido na
 *       resposta se quem pesquisa for o dono da conta ou um admin.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: phone_number
 *         schema:
 *           type: string
 *         required: true
 *         description: Número de telefone (com ou sem +244)
 *         example: "+244923456789"
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicUser'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: >
 *           Erro interno do servidor — inclui o caso de nenhum utilizador
 *           ser encontrado com esse telefone (o endpoint não distingue com
 *           um 404 próprio)
 */

/**
 * @swagger
 * /users/{id}/follow:
 *   post:
 *     summary: Seguir ou deixar de seguir um utilizador (alterna)
 *     tags: [Users]
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
 *         description: Estado alternado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 following:
 *                   type: boolean
 *       400:
 *         description: A tentar seguir-se a si mesmo, ou utilizador não encontrado
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /users/{id}/followers:
 *   get:
 *     summary: Listar quem segue este utilizador (público, paginado)
 *     tags: [Users]
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
 *           default: 20
 *           maximum: 50
 *     responses:
 *       200:
 *         description: Lista paginada de seguidores (apenas anon_name/avatar)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /users/{id}/following:
 *   get:
 *     summary: Listar quem este utilizador segue (público, paginado)
 *     tags: [Users]
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
 *           default: 20
 *           maximum: 50
 *     responses:
 *       200:
 *         description: Lista paginada de quem é seguido (apenas anon_name/avatar)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.use(authMiddleware);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.get("/phone/:phone_number", userController.getUserByPhoneNumber);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.post("/:id/follow", followController.toggleFollow);
router.get("/:id/followers", followController.getFollowers);
router.get("/:id/following", followController.getFollowing);

export default router;
