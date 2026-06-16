require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");

const PORT = process.env.PORT || 3333;

connectDB();
connectRedis();

app.listen(PORT, () => {
  console.log(`🌸 Florita API rodando com sucesso na porta ${PORT}!`);
  console.log(
    `📑 Documentação Swagger disponível em http://localhost:${PORT}/api-docs`,
  );
});
