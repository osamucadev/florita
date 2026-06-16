const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const dictionaryRoutes = require("./dictionary.routes");

/**
 * @openapi
 * /:
 *   get:
 *     summary: Rota raiz da aplicação
 *     description: Retorna a mensagem de identificação padrão.
 *     tags:
 *       - Status
 *     responses:
 *       200:
 *         description: Sucesso ao bater na raiz.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "English Dictionary"
 */
router.get("/", (req, res) => {
  return res.status(200).json({ message: "English Dictionary" });
});

// ROTA DE STATUS PÚBLICA (Healthcheck adicional)
router.get("/status", (req, res) => {
  return res
    .status(200)
    .json({ status: "OK", message: "Florita API operacional" });
});

// Acopla as rotas de autenticação (Abertas) -> Ex: /auth/signup
router.use("/auth", authRoutes);

// Acopla as rotas gerais da aplicação -> Usamos '/' para herdar o caminho fixo direto nos arquivos
router.use("/", dictionaryRoutes);

module.exports = router;
