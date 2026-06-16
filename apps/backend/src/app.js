const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 3333;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Florita API - Dicionário Técnico",
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
  apis: ["./src/routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(routes);

module.exports = app;
