const mongoose = require("mongoose");
const User = require("../models/User");
const History = require("../models/History");
const Favorite = require("../models/Favorite");

/**
 * 👤 1. Perfil do usuário autenticado
 * Endpoint: GET /user/me
 */
const getMe = async (req, res) => {
  const userId = req.userId; // Injetado pelo authMiddleware

  try {
    // .select("-password") garante que o hash da senha NUNCA saia na resposta
    const user = await User.findById(userId).select("-password");

    // Token válido mas usuário inexistente (ex.: conta removida após o login)
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error(`❌ Erro ao buscar perfil do usuário: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Erro ao carregar o perfil do usuário." });
  }
};

/**
 * 📜 2. Listagem cronológica do histórico agrupado por períodos
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
        // Em agregação o Mongo NÃO faz cast automático da string -> ObjectId,
        // então a conversão explícita é obrigatória aqui.
        $match: { userId: new mongoose.Types.ObjectId(userId) },
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
      .status(500)
      .json({ message: "Erro ao carregar o histórico de navegação." });
  }
};

/**
 * ⭐ 3. Listagem geral de todas as palavras favoritadas pelo usuário
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
      .status(500)
      .json({ message: "Erro ao carregar a lista de palavras favoritas." });
  }
};

module.exports = {
  getMe,
  getMyHistory,
  getMyFavorites,
};
