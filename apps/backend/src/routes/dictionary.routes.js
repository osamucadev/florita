const express = require("express");
const router = express.Router();
const dictionaryController = require("../controllers/dictionaryController");
const authMiddleware = require("../middlewares/auth.middleware");

// Protege globalmente todas as rotas de dicionário com a validação JWT
router.use(authMiddleware);

/**
 * @openapi
 * /entries/en:
 *   get:
 *     summary: Lista completa e busca de palavras do dicionário
 *     description: Retorna uma listagem ordenada alfabeticamente utilizando paginação robusta por cursor criptografado em Base64.
 *     tags:
 *       - Dicionário
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo ou prefixo de busca textual para filtrar as palavras.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Quantidade máxima de registros retornados por página.
 *       - in: query
 *         name: next
 *         schema:
 *           type: string
 *         description: Cursor Base64 que aponta para a próxima página de termos (obtido na resposta anterior).
 *       - in: query
 *         name: previous
 *         schema:
 *           type: string
 *         description: Cursor Base64 que aponta para a página anterior de termos (obtido na resposta anterior).
 *     responses:
 *       200:
 *         description: Lista de palavras retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["fire", "fireplace", "firefly", "fireman"]
 *                 totalDocs:
 *                   type: integer
 *                   example: 20
 *                 previous:
 *                   type: string
 *                   nullable: true
 *                   example: "ZXhhbXBsZTE="
 *                 next:
 *                   type: string
 *                   nullable: true
 *                   example: "ZXhhbXBsZTI="
 *                 hasNext:
 *                   type: boolean
 *                   example: true
 *                 hasPrev:
 *                   type: boolean
 *                   example: false
 *       401:
 *         description: Token ausente, inválido ou sessão expirada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sessão inválida ou expirada. Faça login novamente."
 */
router.get("/entries/en", dictionaryController.getEntries);

/**
 * @openapi
 * /entries/en/{word}:
 *   get:
 *     summary: Busca detalhes e definições de uma palavra específica
 *     description: Retorna fonética, significados, exemplos e sinônimos fazendo proxy para a API externa. Possui cache agressivo via Redis e injeta metadados de performance nos Headers. Registra automaticamente no histórico de navegação do usuário.
 *     tags:
 *       - Dicionário
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: word
 *         required: true
 *         schema:
 *           type: string
 *         description: A palavra em inglês que deseja consultar.
 *     responses:
 *       200:
 *         description: Objeto de dados gramaticais e fonéticos retornado com sucesso.
 *         headers:
 *           x-cache:
 *             schema:
 *               type: string
 *               example: HIT
 *             description: Indica se a resposta veio do cache do Redis (HIT) ou da API externa (MISS).
 *           x-response-time:
 *             schema:
 *               type: string
 *               example: 12ms
 *             description: Tempo total que o servidor levou para processar e responder a requisição.
 *       404:
 *         description: Palavra não encontrada na base de dados do dicionário.
 *       401:
 *         description: Usuário não autenticado ou token inválido.
 */
router.get("/entries/en/:word", dictionaryController.getWordDetails);

module.exports = router;
