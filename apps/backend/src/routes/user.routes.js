const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/auth.middleware");

// 🔒 Todas as rotas de perfil exigem token de autenticação válido
router.use(authMiddleware);

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
 *                         type: array
 *                     older:
 *                       type: array
 *                       items:
 *                         type: array
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
 */
router.get("/favorites", userController.getMyFavorites);

module.exports = router;
