const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.DATABASE_URL;

    if (!mongoURI) {
      throw new Error("A variável de ambiente DATABASE_URL não foi definida.");
    }

    const conn = await mongoose.connect(mongoURI);

    console.log(`🍃 MongoDB Conectado com sucesso: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erro ao conectar ao MongoDB: ${error.message}`);
    // Encerra a aplicação caso a conexão inicial falhe
    process.exit(1);
  }
};

// Monitoramento de eventos da conexão após a inicialização
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ Alerta: Conexão com o MongoDB foi perdida.");
});

mongoose.connection.on("error", (err) => {
  console.error(`❌ Erro interno no Mongoose: ${err.message}`);
});

module.exports = connectDB;
