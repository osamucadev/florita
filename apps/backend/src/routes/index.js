const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const dictionaryRoutes = require("./dictionary.routes");

// 🟢 ROTA DE STATUS PUBLICAS (Healthcheck)
router.get("/status", (req, res) => {
  return res
    .status(200)
    .json({ status: "OK", message: "Florita API operacional" });
});

// 🔑 Acopla as rotas de autenticação (Abertas) -> Ex: /auth/signup
router.use("/auth", authRoutes);

// 📖 Acopla as rotas do dicionário (Privadas) -> Ex: /entries/en
router.use("/entries/en", dictionaryRoutes);

// TODO: router.use('/users', userRoutes); -> Para rotas futuras de histórico/favoritos do usuário

module.exports = router;
