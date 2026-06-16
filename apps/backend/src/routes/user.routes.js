const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/auth.middleware");

// 🔒 Todas as rotas de perfil exigem token de autenticação válido
router.use(authMiddleware);

/**
 * @openapi
 * /user/me:
 *   get:
 *     summary: Retorna o perfil do usuário autenticado
 *     description: Retorna os dados públicos do usuário dono do token (sem a senha).
 *     tags:
 *       - Perfil do Usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil retornado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "65f12a3b4c5d6e7f8a9b0c1d"
 *                 name:
 *                   type: string
 *                   example: "Samuel Caetité"
 *                 email:
 *                   type: string
 *                   example: "srcaetite@gmail.com"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Não autorizado. Token ausente ou inválido.
 *       404:
 *         description: Usuário não encontrado.
 */
router.get("/", userController.getMe);

/**
 * @openapi
 * /user/me/history:
 *   get:
 *     summary: Recupera o histórico de consultas do usuário logado
 *     description: Retorna a lista paginada de termos visualizados (mais recentes primeiro), no formato { word, added }. O agrupamento por período é responsabilidade do front-end.
 *     tags:
 *       - Perfil do Usuário
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página (começa em 1).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Quantidade de registros por página (máximo 100).
 *     responses:
 *       200:
 *         description: Histórico retornado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       word:
 *                         type: string
 *                         example: "firefly"
 *                       added:
 *                         type: string
 *                         format: date-time
 *                 totalDocs:
 *                   type: integer
 *                   example: 20
 *                 page:
 *                   type: integer
 *                   example: 2
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 hasNext:
 *                   type: boolean
 *                   example: true
 *                 hasPrev:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Não autorizado. Token ausente ou inválido.
 */
router.get("/history", userController.getMyHistory);

/**
 * @openapi
 * /user/me/favorites:
 *   get:
 *     summary: Lista todas as palavras favoritadas pelo usuário logado
 *     description: Retorna a lista paginada de termos favoritados (mais recentes primeiro), no formato { word, added }.
 *     tags:
 *       - Perfil do Usuário
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página (começa em 1).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Quantidade de registros por página (máximo 100).
 *     responses:
 *       200:
 *         description: Lista de favoritos retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       word:
 *                         type: string
 *                         example: "fireplace"
 *                       added:
 *                         type: string
 *                         format: date-time
 *                 totalDocs:
 *                   type: integer
 *                   example: 20
 *                 page:
 *                   type: integer
 *                   example: 2
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 hasNext:
 *                   type: boolean
 *                   example: true
 *                 hasPrev:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Não autorizado. Token ausente ou inválido.
 */
router.get("/favorites", userController.getMyFavorites);

module.exports = router;
