const express = require("express");
const router = express.Router();
const Dictionary = require("../models/Dictionary");

// Importamos o middleware de autenticação que acabamos de criar
const authMiddleware = require("../middlewares/auth.middleware");

// 🔒 Protege globalmente todas as rotas deste arquivo
router.use(authMiddleware);

/**
 * 📖 GET /entries/en
 * Listagem das palavras com paginação por cursor (Agora protegida!)
 */
router.get("/", async (req, res) => {
  try {
    const { search, limit = 20, cursor } = req.query;
    const parsedLimit = parseInt(limit, 10);
    let query = {};

    if (search) {
      query.word = { $regex: `^${search.trim().toLowerCase()}` };
    }

    if (cursor) {
      if (search) {
        query.$and = [
          { word: { $regex: `^${search.trim().toLowerCase()}` } },
          { word: { $gt: cursor.trim().toLowerCase() } },
        ];
        delete query.word;
      } else {
        query.word = { $gt: cursor.trim().toLowerCase() };
      }
    }

    const words = await Dictionary.find(query)
      .sort({ word: 1 })
      .limit(parsedLimit);
    const nextCursor = words.length > 0 ? words[words.length - 1].word : null;

    // TODO: Adicionar cabeçalho ou propriedade de Cache (Redis)

    return res.status(200).json({
      results: words.map((d) => d.word),
      totalDocs: words.length,
      next: nextCursor,
      hasNav: !!nextCursor,
    });
  } catch (error) {
    console.error(`❌ Erro na paginação: ${error.message}`);
    return res.status(500).json({ error: "Erro interno ao listar os termos." });
  }
});

// TODO: GET /:word -> Buscar detalhes de termo específico e salvar no Histórico
// TODO: POST /:word/favorite -> Favoritar uma palavra
// TODO: DELETE /:word/unfavorite -> Desfavoritar uma palavra

module.exports = router;
