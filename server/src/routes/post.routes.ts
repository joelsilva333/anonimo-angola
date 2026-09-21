import { optionalAuthMiddleware } from "../middleware/optional-auth.middleware";
import postController from "../controllers/post.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { Router } from "express";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: Endpoints para gerenciamento de posts
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PostComment:
 *       type: object
 *       description: Comentário embutido na resposta de um post (com as suas respostas aninhadas)
 *       properties:
 *         id:
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
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [active, deleted, flagged, edited]
 *         like:
 *           type: integer
 *         dislike:
 *           type: integer
 *         has_reacted:
 *           type: boolean
 *           nullable: true
 *         reaction_type:
 *           type: string
 *           enum: [like, dislike]
 *           nullable: true
 *         is_ai_welcome:
 *           type: boolean
 *           description: true se for a mensagem automática de acolhimento gerada pela IA
 *         answers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               userId:
 *                 type: string
 *                 format: uuid
 *               anon_name:
 *                 type: string
 *               profile_picture:
 *                 type: string
 *               text:
 *                 type: string
 *               created_at:
 *                 type: string
 *                 format: date-time
 *               updated_at:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [active, deleted, flagged, edited]
 *               like:
 *                 type: integer
 *               dislike:
 *                 type: integer
 *               has_reacted:
 *                 type: boolean
 *                 nullable: true
 *               reaction_type:
 *                 type: string
 *                 enum: [like, dislike]
 *                 nullable: true
 *
 *     Post:
 *       type: object
 *       description: Forma devolvida por todos os endpoints de leitura/criação de posts (POST, GET /, GET /:id, GET /user/:userId)
 *       properties:
 *         id:
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
 *           example: "Hoje estou me sentindo melhor."
 *         like:
 *           type: integer
 *         dislike:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [active, deleted, flagged]
 *         has_reacted:
 *           type: boolean
 *           nullable: true
 *         reaction_type:
 *           type: string
 *           enum: [like, dislike]
 *           nullable: true
 *         mood_label:
 *           type: string
 *           nullable: true
 *           description: Rótulo de humor privado gerado pela IA (uso interno do diário emocional do autor)
 *         ai_crisis_detected:
 *           type: boolean
 *           description: Sinal de crise emocional detectado pela IA neste desabafo
 *         theme_tags:
 *           type: array
 *           items:
 *             type: string
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PostComment'
 *
 *     SimilarPost:
 *       type: object
 *       description: Forma devolvida por GET /posts/{id}/similar
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         anon_name:
 *           type: string
 *         profile_picture:
 *           type: string
 *         text:
 *           type: string
 *           description: Cortado a 220 caracteres (com "…" no fim, se truncado)
 *         created_at:
 *           type: string
 *           format: date-time
 *         theme_tags:
 *           type: array
 *           items:
 *             type: string
 *         similarity:
 *           type: number
 *           description: Similaridade de cosseno entre os embeddings (0 a 1), arredondada a 2 casas decimais
 *
 *     CreatePostInput:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         text:
 *           type: string
 *           example: "Hoje estou me sentindo melhor."
 *
 *     UpdatePostInput:
 *       type: object
 *       properties:
 *         text:
 *           type: string
 *           example: "Texto atualizado do post."
 *         status:
 *           type: string
 *           enum: [active, deleted, flagged]
 */

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Criar um novo post
 *     description: >
 *       O texto passa pelo filtro de palavrões e por uma análise completa de
 *       IA (Gemini): moderação de segurança, detecção de crise emocional,
 *       rótulo de humor e temas. Em caso de discurso de ódio ou doxxing, a
 *       publicação é bloqueada com 422. Sinais de crise NUNCA bloqueiam a
 *       publicação — apenas marcam `ai_crisis_detected`. Também gera um
 *       comentário automático de "Acolhimento Automático IA" e um embedding
 *       (não devolvido na resposta) para o matching por afinidade.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostInput'
 *     responses:
 *       201:
 *         description: Post criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       422:
 *         description: Bloqueado pela moderação de IA (discurso de ódio ou doxxing)
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Feed principal (paginado, ordenado por um algoritmo de relevância)
 *     description: >
 *       Rota pública. Sem autenticação (ou sem afinidade suficiente ainda),
 *       devolve ordem cronológica simples. Com um token válido, devolve uma
 *       lista já ordenada por um score que combina recência, afinidade
 *       temática (via embeddings, o principal critério), um pequeno
 *       impulso para quem segues, e engagement como desempate leve — de
 *       propósito, para não promover o mais viral/dramático em vez do mais
 *       relevante. Posts já vistos pelo utilizador são penalizados no
 *       score, nunca escondidos. A resposta inclui `has_reacted`/
 *       `reaction_type` quando autenticado.
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 15
 *           maximum: 50
 *     responses:
 *       200:
 *         description: Lista de posts da página pedida
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Buscar post por ID
 *     description: Rota pública, com autenticação opcional (ver GET /posts).
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Post encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       500:
 *         description: >
 *           Erro interno do servidor — inclui post não encontrado (o
 *           endpoint não distingue com um 404 próprio)
 */

/**
 * @swagger
 * /posts/user/{userId}:
 *   get:
 *     summary: Listar posts de um usuário
 *     description: Rota pública, com autenticação opcional (ver GET /posts).
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de posts do usuário (vazia se o utilizador não existir ou não tiver posts)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Atualizar post (apenas o autor)
 *     description: >
 *       Não passa pela moderação de IA — apenas pelo filtro de palavrões.
 *       Devolve um subconjunto dos campos do post (sem `like`/`dislike`,
 *       `comments`, etc.).
 *     tags: [Posts]
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePostInput'
 *     responses:
 *       200:
 *         description: Post atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                 anon_name:
 *                   type: string
 *                 profile_picture:
 *                   type: string
 *                 text:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 status:
 *                   type: string
 *                   enum: [active, deleted, flagged]
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: >
 *           Erro interno do servidor — inclui post não encontrado e
 *           tentativa de editar post de outro utilizador (não são
 *           distinguidos com 404/403 próprios)
 */

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Remover post (apenas o autor)
 *     tags: [Posts]
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
 *       204:
 *         description: Post removido com sucesso
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: >
 *           Erro interno do servidor — inclui post não encontrado e
 *           falta de permissão (não são distinguidos com 404/403 próprios)
 */

// PRIVADAS
router.post("/", authMiddleware, postController.create);
router.put("/:id", authMiddleware, postController.updatePost);
router.delete("/:id", authMiddleware, postController.deletePost);

// PÚBLICAS
router.get("/", optionalAuthMiddleware, postController.getAll);
router.get(
  "/user/:userId",
  optionalAuthMiddleware,
  postController.getAllByUserId,
);

/**
 * @swagger
 * /posts/{id}/similar:
 *   get:
 *     summary: "Relatos semelhantes que podes querer ler (matching por afinidade via IA)"
 *     description: >
 *       Compara o embedding do post com os de todos os outros posts activos
 *       via similaridade de cosseno. Devolve lista vazia se o post-alvo
 *       ainda não tiver embedding gerado.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de até 3 posts semelhantes, ordenados por similaridade decrescente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SimilarPost'
 *       500:
 *         description: >
 *           Erro interno do servidor — inclui post não encontrado (o
 *           endpoint não distingue com um 404 próprio)
 */
router.get("/:id/similar", optionalAuthMiddleware, postController.getSimilar);

router.get("/:id", optionalAuthMiddleware, postController.getById);

export default router;
