const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
require("dotenv").config();

const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 3333;

// Inicializa a conexão com o banco de dados NoSQL e com o Redis
connectDB();
connectRedis();

// Configurações Globais do OpenAPI 3.0 (Swagger)
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Florita API — Dicionário Técnico",
      version: "1.0.0",
      description:
        "API RESTful para consulta de termos em inglês e gerenciamento de perfis da Flora Energia.",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Servidor Local de Desenvolvimento (WSL/Docker)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Insira o token JWT gerado no login no formato: Bearer <token>",
        },
      },
    },
  },
  // O swagger-jsdoc vai varrer todos os arquivos .js dentro da pasta de rotas procurando as anotações @openapi
  apis: ["./src/routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Middlewares Globais
app.use(cors());
app.use(express.json());

// Rota da Documentação Interativa da API
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Centralizador de Rotas da Aplicação
app.use(routes);

app.listen(PORT, () => {
  console.log(`🌸 Florita API rodando com sucesso na porta ${PORT}!`);
  console.log(
    `📑 Documentação Swagger disponível em http://localhost:${PORT}/api-docs`,
  );
});
