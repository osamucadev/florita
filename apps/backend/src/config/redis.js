const { createClient } = require("redis");

// Puxa a URL do Redis do ambiente do container (ex: redis://redis:6379)
const redisURL = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = createClient({
  url: redisURL,
});

redisClient.on("error", (err) => {
  console.error(`❌ Erro no cliente Redis: ${err.message}`);
});

redisClient.on("connect", () => {
  console.log("⚡ Conexão estabelecida com o servidor Redis com sucesso!");
});

// Inicializa a conexão assíncrona do Redis
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error(`❌ Falha crítica ao conectar ao Redis: ${error.message}`);
    console.warn(
      "⚠️ O sistema continuará operando sem cache (Fallback para API externa/Banco).",
    );
  }
};

module.exports = {
  redisClient,
  connectRedis,
};
