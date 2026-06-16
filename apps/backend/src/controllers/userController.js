const History = require("../models/History");
const Favorite = require("../models/Favorite");

/**
 * 📜 1. Listagem cronológica do histórico agrupado por períodos
 * Endpoint: GET /user/me/history
 */
const getMyHistory = async (req, res) => {
  const userId = req.userId; // Recuperado de forma segura pelo authMiddleware

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    // Pipeline de agregação para agrupar os logs direto na memória do banco NoSQL
    const historyGrouped = await History.aggregate([
      {
        $match: { userId: new require("mongoose").Types.ObjectId(userId) },
      },
      {
        $sort: { createdAt: -1 }, // Aproveita o índice composto { userId: 1, createdAt: -1 }
      },
      {
        $facet: {
          Hoje: [
            { $match: { createdAt: { $gte: todayStart } } },
            { $project: { _id: 0, word: 1, added: "$createdAt" } },
          ],
          Ontem: [
            {
              $match: { createdAt: { $gte: yesterdayStart, $lt: todayStart } },
            },
            { $project: { _id: 0, word: 1, added: "$createdAt" } },
          ],
          Anteriores: [
            { $match: { createdAt: { $lt: yesterdayStart } } },
            { $project: { _id: 0, word: 1, added: "$createdAt" } },
          ],
        },
      },
    ]);

    // Extrai o resultado da agregação facetada
    const result = historyGrouped[0] || { Hoje: [], Ontem: [], Anteriores: [] };

    return res.status(200).json({
      results: {
        today: result.Hoje,
        yesterday: result.Ontem,
        older: result.Anteriores,
      },
    });
  } catch (error) {
    console.error(`❌ Erro ao buscar histórico do usuário: ${error.message}`);
    return res
      .status(400)
      .json({ message: "Erro ao carregar o histórico de navegação." });
  }
};

/**
 * ⭐ 2. Listagem geral de todas as palavras favoritadas pelo usuário
 * Endpoint: GET /user/me/favorites
 */
const getMyFavorites = async (req, res) => {
  const userId = req.userId;

  try {
    // Busca todos os favoritos ordenando pelos mais recentes adicionados
    const favorites = await Favorite.find({ userId })
      .sort({ createdAt: -1 })
      .select("word createdAt -_id");

    return res.status(200).json({
      results: favorites.map((fav) => ({
        word: fav.word,
        added: fav.createdAt,
      })),
    });
  } catch (error) {
    console.error(`❌ Erro ao buscar favoritos do usuário: ${error.message}`);
    return res
      .status(400)
      .json({ message: "Erro ao carregar a lista de palavras favoritas." });
  }
};

module.exports = {
  getMyHistory,
  getMyFavorites,
};
