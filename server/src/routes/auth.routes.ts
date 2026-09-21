import { Router } from "express";
import authController from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Autenticação e gestão de credenciais de utilizadores
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthLoginInput:
 *       type: object
 *       required:
 *         - anon_name
 *         - password
 *       properties:
 *         anon_name:
 *           type: string
 *           example: joel123
 *         password:
 *           type: string
 *           example: minhaSenha@123
 *
 *     AuthUser:
 *       type: object
 *       description: >
 *         Forma do utilizador devolvida ao autenticar. Nunca inclui
 *         password_hash nem google_id_hash — apenas o booleano
 *         `google_linked`.
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         anon_name:
 *           type: string
 *           example: "Anon123"
 *         phone_number:
 *           type: string
 *           description: Ausente na resposta do login com Google
 *         profile_picture:
 *           type: string
 *         is_active:
 *           type: boolean
 *         google_linked:
 *           type: boolean
 *           description: true se esta conta tiver uma conta Google vinculada
 *         onboarding_completed:
 *           type: boolean
 *           description: >
 *             false só para contas criadas via Google que ainda não
 *             escolheram o nome anónimo definitivo — o frontend deve
 *             bloquear o resto da app com um modal até ficar true (via
 *             POST /auth/complete-onboarding)
 *
 *     AuthLoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Sessão iniciada com sucesso
 *         user:
 *           $ref: '#/components/schemas/AuthUser'
 *         token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *     AuthRegisterInput:
 *       type: object
 *       description: >
 *         O telefone é totalmente opcional na criação da conta — só serve
 *         para recuperação e pode ser adicionado depois (ver POST
 *         /auth/add-phone). Se enviado, `firebase_token` passa a ser
 *         obrigatório para o comprovar.
 *       required:
 *         - anon_name
 *         - password
 *       properties:
 *         anon_name:
 *           type: string
 *           minLength: 5
 *           maxLength: 24
 *           pattern: '^(?=.*\d)[a-z0-9_]{5,24}$'
 *           description: >
 *             Só minúsculas, números e "_", com pelo menos um número.
 *             Passa também por uma verificação por IA que rejeita nomes
 *             que pareçam identificar a pessoa.
 *           example: joel123
 *         phone_number:
 *           type: string
 *           maxLength: 15
 *           example: "+244923000000"
 *         password:
 *           type: string
 *           minLength: 6
 *           maxLength: 60
 *           example: minhaSenha@123
 *         firebase_token:
 *           type: string
 *           description: >
 *             Obrigatório apenas se `phone_number` for enviado. ID token do
 *             Firebase obtido após verificar o número por SMS
 *             (signInWithPhoneNumber). O número verificado no token tem de
 *             coincidir com `phone_number`.
 *         google_token:
 *           type: string
 *           description: >
 *             Opcional. ID token do Firebase de uma sessão "Sign in with
 *             Google" feita no cliente antes do registo. Se enviado, a
 *             conta fica vinculada ao Google já na criação (permite login
 *             rápido depois), sem nunca guardar email/nome/foto do Google.
 *
 *     RequestPasswordResetInput:
 *       type: object
 *       required:
 *         - phone_number
 *       properties:
 *         phone_number:
 *           type: string
 *           example: "+244923000000"
 *
 *     ResetPasswordWithOtpInput:
 *       type: object
 *       required:
 *         - phone_number
 *         - firebase_token
 *         - new_password
 *       properties:
 *         phone_number:
 *           type: string
 *           example: "+244923000000"
 *         firebase_token:
 *           type: string
 *           description: ID token do Firebase obtido após confirmar o código SMS (signInWithPhoneNumber + confirm)
 *           example: eyJhbGciOi...
 *         new_password:
 *           type: string
 *           minLength: 6
 *           example: novaSenha@2026
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Criar um novo utilizador (telefone opcional)
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRegisterInput'
 *     responses:
 *       '201':
 *         description: Utilizador criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Utilizador criado com sucesso
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '500':
 *         description: >
 *           Erro interno do servidor — inclui regras de negócio como
 *           nome rejeitado pela verificação de anonimato da IA, telefone
 *           não verificado, nome ou telefone já em uso, token do Google
 *           inválido ou conta Google já vinculada a outro perfil (não são
 *           distinguidos com códigos próprios)
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Fazer login e receber JWT
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLoginInput'
 *     responses:
 *       '200':
 *         description: Sessão iniciada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthLoginResponse'
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '500':
 *         description: Erro interno do servidor
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/google/login:
 *   post:
 *     summary: Login rápido com Google — cria a conta na hora se ainda não existir
 *     description: >
 *       Recebe um ID token do Firebase resultante de um "Sign in with Google"
 *       feito no cliente. Nunca lê nem guarda o email, nome ou foto do
 *       Google — apenas um hash irreversível do UID. Se já houver uma
 *       conta vinculada a esse UID, faz login. Caso contrário, **cria uma
 *       conta nova na hora** (sem senha, sem telefone, com um nome
 *       temporário) — a entrada nunca fica bloqueada por passos de
 *       verificação. Quando a conta é criada, a resposta traz
 *       `user.onboarding_completed: false` e o frontend deve forçar a
 *       escolha de um nome anónimo definitivo (ver POST
 *       /auth/complete-onboarding) antes de liberar o resto da app.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firebase_token]
 *             properties:
 *               firebase_token:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Sessão iniciada com sucesso (conta já existia)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthLoginResponse'
 *       '201':
 *         description: Conta criada e sessão iniciada com sucesso (primeira vez com este Google)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthLoginResponse'
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         description: Token do Google inválido ou expirado
 */
router.post("/google/login", authController.loginWithGoogle);

/**
 * @swagger
 * /auth/complete-onboarding:
 *   post:
 *     summary: Definir o nome anónimo definitivo (contas criadas via Google)
 *     description: >
 *       Passo final obrigatório para contas criadas via Google com
 *       `onboarding_completed: false`. Valida o formato do nome e corre
 *       uma verificação por IA para garantir que não parece um nome real
 *       nem contém dados de contacto.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [anon_name]
 *             properties:
 *               anon_name:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 24
 *     responses:
 *       '200':
 *         description: Nome definido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/AuthUser'
 *       '400':
 *         description: >
 *           Formato inválido, nome já em uso, ou rejeitado pela verificação
 *           de anonimato da IA
 *       '401':
 *         description: Não autenticado
 */
router.post(
  "/complete-onboarding",
  authMiddleware,
  authController.completeOnboarding,
);

/**
 * @swagger
 * /auth/add-phone:
 *   post:
 *     summary: Associar um telefone de recuperação a uma conta já existente
 *     description: >
 *       Nunca é obrigatório para usar a app — só é necessário se a pessoa
 *       quiser garantir que consegue recuperar a conta caso perca também o
 *       acesso ao Google. Exige um `firebase_token` de verificação por SMS
 *       (signInWithPhoneNumber + confirm), tal como no registo.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone_number, firebase_token]
 *             properties:
 *               phone_number:
 *                 type: string
 *                 example: "+244923000000"
 *               firebase_token:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Telefone associado com sucesso
 *       '400':
 *         description: >
 *           Token/código inválido, número não coincide com o verificado, ou
 *           número já associado a outra conta
 *       '401':
 *         description: Não autenticado
 */
router.post("/add-phone", authMiddleware, authController.addPhoneNumber);

/**
 * @swagger
 * /auth/google/link:
 *   post:
 *     summary: Vincular a conta Google do utilizador autenticado
 *     description: Permite logins rápidos futuros via Google, sem guardar dados identificáveis do Google.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firebase_token]
 *             properties:
 *               firebase_token:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Conta Google vinculada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Conta Google vinculada com sucesso
 *       '400':
 *         description: Erro de validação, token inválido ou conta Google já vinculada a outro perfil
 *       '401':
 *         description: Não autenticado
 */
router.post("/google/link", authMiddleware, authController.linkGoogleAccount);

/**
 * @swagger
 * /auth/request-reset:
 *   post:
 *     summary: Solicitar recuperação da palavra-passe
 *     description: Valida se o utilizador existe. Por motivos de segurança e anonimato, a resposta é sempre 200.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestPasswordResetInput'
 *     responses:
 *       '200':
 *         description: Se o número estiver registado, o OTP foi enviado.
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '500':
 *         description: Erro interno do servidor
 */
router.post("/request-reset", authController.requestPasswordReset);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Redefinir a palavra-passe utilizando OTP
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordWithOtpInput'
 *     responses:
 *       '200':
 *         description: Palavra-passe alterada com sucesso
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '500':
 *         description: Erro interno do servidor
 */
router.post("/reset-password", authController.resetPasswordWithOtp);

export default router;
