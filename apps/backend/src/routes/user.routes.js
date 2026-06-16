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
 *     description: Retorna a lista de termos pesquisados, processada e agrupada cronologicamente em blocos de tempo ("Hoje", "Ontem" e "Anteriores") direto pelo banco de dados.
 *     tags:
 *       - Perfil do Usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Histórico cronológico retornado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: object
 *                   properties:
 *                     today:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           word:
 *                             type: string
 *                             example: "firefly"
 *                           added:
 *                             type: string
 *                             format: date-time
 *                     yesterday:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           word:
 *                             type: string
 *                           added:
 *                             type: string
 *                             format: date-time
 *                     older:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           word:
 *                             type: string
 *                           added:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Não autorizado. Token ausente ou inválido.
 */
router.get("/history", userController.getMyHistory);

/**
 * @openapi
 * /user/me/favorites:
 *   get:
 *     summary: Lista todas as palavras favoritadas pelo usuário logado
 *     description: Retorna os termos que o usuário favoritou ordenados do mais recente para o mais antigo.
 *     tags:
 *       - Perfil do Usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de favoritos carregada com sucesso.
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
 *       401:
 *         description: Não autorizado. Token ausente ou inválido.
 */
router.get("/favorites", userController.getMyFavorites);

module.exports = router;
