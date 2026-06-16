const User = require("../models/User");
const History = require("../models/History");
const Favorite = require("../models/Favorite");

// Sanitiza page/limit vindos da query string (evita NaN, valores <1 e teto de 100)
const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  return { page, limit };
};

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
 * 📜 2. Histórico de palavras visualizadas (lista paginada, mais recentes primeiro)
 * Endpoint: GET /user/me/history
 * Retorna o array plano { word, added } conforme o contrato do edital.
 * O agrupamento por período (Hoje/Ontem/...) fica a cargo do front-end.
 */
const getMyHistory = async (req, res) => {
  const userId = req.userId;

  try {
    const { page, limit } = parsePagination(req.query);

    const totalDocs = await History.countDocuments({ userId });
    const totalPages = Math.ceil(totalDocs / limit) || 0;

    const history = await History.find({ userId })
      .sort({ createdAt: -1 }) // Aproveita o índice composto { userId: 1, createdAt: -1 }
      .skip((page - 1) * limit)
      .limit(limit)
      .select("word createdAt -_id");

    return res.status(200).json({
      results: history.map((h) => ({ word: h.word, added: h.createdAt })),
      totalDocs,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  } catch (error) {
    console.error(`❌ Erro ao buscar histórico do usuário: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Erro ao carregar o histórico de navegação." });
  }
};

/**
 * ⭐ 3. Lista de palavras favoritadas (paginada, mais recentes primeiro)
 * Endpoint: GET /user/me/favorites
 */
const getMyFavorites = async (req, res) => {
  const userId = req.userId;

  try {
    const { page, limit } = parsePagination(req.query);

    const totalDocs = await Favorite.countDocuments({ userId });
    const totalPages = Math.ceil(totalDocs / limit) || 0;

    const favorites = await Favorite.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("word createdAt -_id");

    return res.status(200).json({
      results: favorites.map((fav) => ({
        word: fav.word,
        added: fav.createdAt,
      })),
      totalDocs,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
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
