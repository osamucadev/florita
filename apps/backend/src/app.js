const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3333;

// Middlewares básicos
app.use(cors());
app.use(express.json());

/**
 * @openapi
 * /:
 *   get:
 *     summary: Rota inicial da API Florita
 *     responses:
 *       200:
 *         description: Mensagem de boas-vindas do dicionário
 */
app.get("/", (req, res) => {
  return res.status(200).json({ message: "English Dictionary" });
});

app.listen(PORT, () => {
  console.log(`🌸 Florita API rodando com sucesso na porta ${PORT}!`);
});
