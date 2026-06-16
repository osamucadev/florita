const axios = require("axios");
const Dictionary = require("../models/Dictionary");
const History = require("../models/History");
const Favorite = require("../models/Favorite");
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

    // Sanitiza o limite: evita NaN e impede abuso com valores absurdos (teto de 100)
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const sortOrder = { word: 1 }; // Padrão alfabético ascendente

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

    // ──────────────────────────────────────────────────────────────
    // Busca por PREFIXO usando range no índice { word: 1 }.
    // Ex.: search="fire" → { word: { $gte: "fire", $lt: "fire\uffff" } }
    // retornando "fire", "firefly", "fireplace"...
    // (\uffff funciona como limite superior pois nenhuma palavra do
    //  dicionário contém caracteres maiores que ele).
    // Operar sobre 'word' (igual ao cursor) elimina o $text e o conflito
    // de "dois $text na mesma query" que estourava 400 ao paginar buscas.
    // ──────────────────────────────────────────────────────────────
    const term = search ? search.trim().toLowerCase() : null;

    // Filtro base: somente o recorte da busca (sem cursor). Usado p/ o total.
    const baseWordFilter = {};
    if (term) {
      baseWordFilter.$gte = term;
      baseWordFilter.$lt = term + "\uffff";
    }
    const baseQuery = Object.keys(baseWordFilter).length
      ? { word: baseWordFilter }
      : {};

    // Total de documentos que casam com a busca (independente da página atual)
    const totalDocs = await Dictionary.countDocuments(baseQuery);

    // Filtro da página: parte do filtro base e aplica o cursor por cima.
    const pageWordFilter = { ...baseWordFilter };

    if (previous) {
      // Cursor reverso: pega os termos imediatamente anteriores ao cursor.
      const decodedPrevious = Buffer.from(previous, "base64").toString("utf-8");
      pageWordFilter.$lt = decodedPrevious; // mais restritivo que o teto do prefixo
      sortOrder.word = -1; // Inverte para "andar para trás"
    } else if (next) {
      // Cursor direto: pega os termos imediatamente posteriores ao cursor.
      const decodedNext = Buffer.from(next, "base64").toString("utf-8");
      delete pageWordFilter.$gte; // o $gt do cursor substitui o piso do prefixo
      pageWordFilter.$gt = decodedNext;
    }

    const query = Object.keys(pageWordFilter).length
      ? { word: pageWordFilter }
      : {};

    // Executa a busca no MongoDB
    let words = await Dictionary.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort(sortOrder)
      .limit(parsedLimit);

    // Se usamos o cursor previous, os resultados vêm invertidos; reordenamos
    if (previous) {
      words = words.reverse();
    }

    // Determina os novos ponteiros Base64 para as pontas da lista retornada
    const firstWord = words.length > 0 ? words[0].word : null;
    const lastWord = words.length > 0 ? words[words.length - 1].word : null;

    let hasNext = false;
    let hasPrev = false;

    // Existe alguma palavra DEPOIS da última (dentro do recorte da busca)?
    if (lastWord) {
      const nextCheck = await Dictionary.findOne({
        word: {
          $gt: lastWord,
          ...(term ? { $lt: term + "\uffff" } : {}),
        },
      })
        .collation({ locale: "en", strength: 2 })
        .sort({ word: 1 });
      hasNext = !!nextCheck;
    }

    // Existe alguma palavra ANTES da primeira (dentro do recorte da busca)?
    if (firstWord) {
      const prevCheck = await Dictionary.findOne({
        word: {
          $lt: firstWord,
          ...(term ? { $gte: term } : {}),
        },
      }).sort({ word: -1 });
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

    // Salva o payload da listagem no Redis com TTL curto de 5 minutos
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
      .status(500)
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
        // encodeURIComponent protege contra palavras com caracteres especiais
        const externalApiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
          normalizedWord,
        )}`;
        // timeout evita requisições penduradas caso a API externa trave
        const response = await axios.get(externalApiUrl, { timeout: 5000 });

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

    // Registra no histórico apenas na primeira visualização (upsert sem update)
    try {
      await History.updateOne(
        { userId, word: normalizedWord },
        {
          $setOnInsert: { userId, word: normalizedWord, createdAt: new Date() },
        },
        { upsert: true },
      );
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
    // Falha na API externa / Redis é problema de servidor, não do cliente
    return res
      .status(500)
      .json({ message: "Erro ao processar a busca de detalhes do termo." });
  }
};

/**
 * ⭐ 3. Favoritar uma palavra
 * Endpoint: POST /entries/en/:word/favorite
 */
const favoriteWord = async (req, res) => {
  const { word } = req.params;
  const userId = req.userId; // Injetado pelo authMiddleware

  if (!word) {
    return res
      .status(400)
      .json({ message: "O parâmetro palavra é obrigatório." });
  }

  const normalizedWord = word.trim().toLowerCase();

  try {
    // try/catch focado na inserção para capturar a duplicidade do índice único
    try {
      await Favorite.create({
        userId,
        word: normalizedWord,
      });
    } catch (dbError) {
      // Código 11000 = índice único barrou (o usuário já tinha favoritado)
      if (dbError.code === 11000) {
        // 400 Conflict descreve melhor um conflito de estado que 400.
        return res
          .status(400)
          .json({ message: "Esta palavra já está na sua lista de favoritos." });
      }
      throw dbError;
    }

    // 204 (No Content) para escrita bem-sucedida sem corpo de resposta
    return res.status(204).send();
  } catch (error) {
    console.error(`❌ Erro ao favoritar palavra: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Erro ao processar a ação de favoritar." });
  }
};

/**
 * 🗑️ 4. Desfavoritar uma palavra
 * Endpoint: DELETE /entries/en/:word/unfavorite
 */
const unfavoriteWord = async (req, res) => {
  const { word } = req.params;
  const userId = req.userId;

  if (!word) {
    return res
      .status(400)
      .json({ message: "O parâmetro palavra é obrigatório." });
  }

  const normalizedWord = word.trim().toLowerCase();

  try {
    const result = await Favorite.deleteOne({
      userId,
      word: normalizedWord,
    });

    // Nenhum documento deletado = a palavra não estava favoritada
    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Esta palavra não foi encontrada na sua lista de favoritos.",
      });
    }

    // 204 (No Content) conforme as restrições do edital
    return res.status(204).send();
  } catch (error) {
    console.error(`❌ Erro ao desfavoritar palavra: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Erro ao processar a ação de desfavoritar." });
  }
};

module.exports = {
  getEntries,
  getWordDetails,
  favoriteWord,
  unfavoriteWord,
};
