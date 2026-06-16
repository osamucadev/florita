const axios = require("axios");
const Dictionary = require("../models/Dictionary");
const History = require("../models/History");
const { redisClient } = require("../config/redis");

/**
 * 📖 1. Listagem paginada por cursor e busca textual
 * Endpoint: GET /entries/en
 */
const getEntries = async (req, res) => {
  // 🔥 Inicia o cronômetro para medir a latência da query
  const startTime = Date.now();

  try {
    const { search, limit = 20, next, previous } = req.query;
    const parsedLimit = parseInt(limit, 10);

    let query = {};
    let sortOrder = { word: 1 }; // Padrão alfabético ascendente

    // Cria uma chave de cache dinâmica baseada nos parâmetros da query string
    const cacheKey = `entries:search=${search || ""}:limit=${parsedLimit}:next=${next || ""}:prev=${previous || ""}`;
    let cachedData = null;
    let cacheStatus = "MISS";

    // ⚡ Tenta buscar a página inteira no cache do Redis para performance extrema
    if (redisClient.isOpen) {
      const result = await redisClient.get(cacheKey);
      if (result) {
        cachedData = JSON.parse(result);
        cacheStatus = "HIT";
      }
    }

    if (cachedData) {
      const responseTime = Date.now() - startTime;
      res.setHeader("x-cache", cacheStatus);
      res.setHeader("x-response-time", `${responseTime}ms`);
      return res.status(200).json(cachedData);
    }

    // 1. Aplica busca textual se o parâmetro 'search' existir
    if (search) {
      query.$text = { $search: search.trim().toLowerCase() };
    }

    // Contagem total de documentos baseados no filtro de busca atual
    const totalDocs = await Dictionary.countDocuments(query);

    // 2. Lógica de Cursor Reverso (Voltar Página - Previous)
    if (previous) {
      const decodedPrevious = Buffer.from(previous, "base64").toString("utf-8");
      if (search) {
        query.$and = [
          { $text: { $search: search.trim().toLowerCase() } },
          { word: { $lt: decodedPrevious } },
        ];
      } else {
        query.word = { $lt: decodedPrevious };
      }
      sortOrder.word = -1; // Inverte para pegar os elementos imediatamente anteriores
    }
    // 3. Lógica de Cursor Direto (Avançar Página - Next)
    else if (next) {
      const decodedNext = Buffer.from(next, "base64").toString("utf-8");
      if (search) {
        query.$and = [
          { $text: { $search: search.trim().toLowerCase() } },
          { word: { $gt: decodedNext } },
        ];
      } else {
        query.word = { $gt: decodedNext };
      }
    }

    // Executa a busca no MongoDB
    let words = await Dictionary.find(query).sort(sortOrder).limit(parsedLimit);

    // Se usamos o cursor previous, os resultados vêm invertidos do banco; reordenamos alfabeticamente
    if (previous) {
      words = words.reverse();
    }

    // Determina os novos ponteiros Base64 para as pontas da lista retornada
    const firstWord = words.length > 0 ? words[0].word : null;
    const lastWord = words.length > 0 ? words[words.length - 1].word : null;

    let hasNext = false;
    let hasPrev = false;

    if (lastWord) {
      const nextCheckQuery = { ...query };
      if (search) {
        nextCheckQuery.$and = [
          { $text: { $search: search.trim().toLowerCase() } },
          { word: { $gt: lastWord } },
        ];
      } else {
        nextCheckQuery.word = { $gt: lastWord };
      }
      const nextCheck = await Dictionary.findOne(nextCheckQuery).sort({
        word: 1,
      });
      hasNext = !!nextCheck;
    }

    if (firstWord) {
      const prevCheckQuery = { ...query };
      if (search) {
        prevCheckQuery.$and = [
          { $text: { $search: search.trim().toLowerCase() } },
          { word: { $lt: firstWord } },
        ];
      } else {
        prevCheckQuery.word = { $lt: firstWord };
      }
      const prevCheck = await Dictionary.findOne(prevCheckQuery).sort({
        word: -1,
      });
      hasPrev = !!prevCheck;
    }

    const nextCursorBase64 =
      hasNext && lastWord ? Buffer.from(lastWord).toString("base64") : null;
    const prevCursorBase64 =
      hasPrev && firstWord ? Buffer.from(firstWord).toString("base64") : null;

    const responsePayload = {
      results: words.map((d) => d.word),
      totalDocs,
      previous: prevCursorBase64,
      next: nextCursorBase64,
      hasNext,
      hasPrev,
    };

    // Salva o payload da listagem no Redis com TTL curto de 5 minutos para otimizar navegações repetidas
    if (redisClient.isOpen && words.length > 0) {
      await redisClient.set(cacheKey, JSON.stringify(responsePayload), {
        EX: 300,
      });
    }

    const responseTime = Date.now() - startTime;
    res.setHeader("x-cache", cacheStatus);
    res.setHeader("x-response-time", `${responseTime}ms`);

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error(`❌ Erro no motor de paginação por cursor: ${error.message}`);
    const responseTime = Date.now() - startTime;
    res.setHeader("x-response-time", `${responseTime}ms`);
    return res
      .status(400)
      .json({ message: "Erro ao processar a paginação dos termos." });
  }
};

/**
 * 🔍 2. Detalhes de uma palavra (Proxy + Cache Redis + Registro de Histórico)
 * Endpoint: GET /entries/en/:word
 */
const getWordDetails = async (req, res) => {
  const startTime = Date.now();
  const { word } = req.params;
  const userId = req.userId;

  if (!word) {
    return res
      .status(400)
      .json({ message: "O parâmetro palavra é obrigatório." });
  }

  const normalizedWord = word.trim().toLowerCase();
  const cacheKey = `word:${normalizedWord}`;

  try {
    let wordData = null;
    let cacheStatus = "MISS";

    if (redisClient.isOpen) {
      const cachedResult = await redisClient.get(cacheKey);
      if (cachedResult) {
        wordData = JSON.parse(cachedResult);
        cacheStatus = "HIT";
      }
    }

    if (!wordData) {
      try {
        const externalApiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${normalizedWord}`;
        const response = await axios.get(externalApiUrl);

        wordData = response.data;

        if (redisClient.isOpen) {
          await redisClient.set(cacheKey, JSON.stringify(wordData), {
            EX: 86400, // 24 Horas de retenção
          });
        }
      } catch (apiError) {
        if (apiError.response && apiError.response.status === 404) {
          const responseTime = Date.now() - startTime;
          res.setHeader("x-cache", "MISS");
          res.setHeader("x-response-time", `${responseTime}ms`);
          return res.status(404).json({
            message: "Definição não encontrada para o termo especificado.",
          });
        }
        throw apiError;
      }
    }

    // Salva de forma assíncrona e isolada no Histórico NoSQL
    try {
      await History.create({
        userId,
        word: normalizedWord,
      });
    } catch (historyError) {
      console.error(
        `⚠️ Falha não impeditiva ao gravar log de histórico: ${historyError.message}`,
      );
    }

    const responseTime = Date.now() - startTime;
    res.setHeader("x-cache", cacheStatus);
    res.setHeader("x-response-time", `${responseTime}ms`);

    return res.status(200).json(wordData);
  } catch (error) {
    console.error(`❌ Erro no fluxo de detalhes da palavra: ${error.message}`);
    const responseTime = Date.now() - startTime;
    res.setHeader("x-response-time", `${responseTime}ms`);
    return res
      .status(400)
      .json({ message: "Erro ao processar a busca de detalhes do termo." });
  }
};

module.exports = {
  getEntries,
  getWordDetails,
};
