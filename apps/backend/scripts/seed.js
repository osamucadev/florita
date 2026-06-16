const fs = require("fs");
const path = require("path");
const readline = require("readline");
const axios = require("axios");
const mongoose = require("mongoose");

// Importamos o Schema do Dicionário para sabermos onde injetar
const Dictionary = require("../src/models/Dictionary");

// Configuração da URL de carga e tamanho do lote
const WORDS_URL =
  "https://raw.githubusercontent.com/meetDeveloper/freeDictionaryAPI/refs/heads/master/meta/wordList/english.txt";
const BATCH_SIZE = 2000;

async function runSeed() {
  try {
    console.log("🔗 Conectando ao MongoDB para inicializar o Seed...");
    // Puxa a string de conexão do ambiente do container
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("🍃 Conexão de Seed estabelecida com o MongoDB.");

    console.log(
      "📡 Buscando lista oficial de palavras (Free Dictionary API)...",
    );

    // Baixa o arquivo em modo Stream para não estourar a memória RAM
    const response = await axios({
      method: "get",
      url: WORDS_URL,
      responseType: "stream",
    });

    // Configura a leitura linha por linha da Stream HTTP
    const rl = readline.createInterface({
      input: response.data,
      crlfDelay: Infinity,
    });

    let currentBatch = [];
    let totalProcessed = 0;

    console.log("⚙️ Processando palavras e injetando em blocos NoSQL...");

    for await (const line of rl) {
      const trimmedWord = line.trim().toLowerCase();

      // Validação básica: ignora linhas vazias ou caracteres estranhos
      if (trimmedWord && /^[a-zA-Z-]+$/.test(trimmedWord)) {
        currentBatch.push({
          insertOne: {
            document: { word: trimmedWord },
          },
        });
      }

      // Quando atingimos o tamanho do lote, disparamos a gravação em massa
      if (currentBatch.length === BATCH_SIZE) {
        // ordered: false garante que se houver uma palavra duplicada, ele ignora o erro e continua o lote
        await Dictionary.bulkWrite(currentBatch, { ordered: false }).catch(
          () => {},
        );
        totalProcessed += currentBatch.length;
        console.log(
          `📦 Lote processado: ${totalProcessed} palavras persistidas...`,
        );
        currentBatch = []; // Limpa o lote atual
      }
    }

    // Injeta o que sobrou no último lote parcial
    if (currentBatch.length > 0) {
      await Dictionary.bulkWrite(currentBatch, { ordered: false }).catch(
        () => {},
      );
      totalProcessed += currentBatch.length;
    }

    console.log(
      `🏁 Carga concluída com sucesso! Total de ${totalProcessed} palavras prontas para busca.`,
    );
  } catch (error) {
    console.error(
      `❌ Falha crítica durante a execução do Seed: ${error.message}`,
    );
  } finally {
    // Sempre fecha a conexão com o banco ao terminar um script
    await mongoose.connection.close();
    console.log("🔌 Conexão de Seed encerrada.");
    process.exit(0);
  }
}

runSeed();
