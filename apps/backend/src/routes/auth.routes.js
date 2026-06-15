const express = require("express");
const router = express.Router();

router.post("/signup", (req, res) => {
  // TODO: Criar criptografia de senha e gravação no banco de dados
  return res
    .status(501)
    .json({ message: "Funcionalidade de cadastro em construção." });
});

router.post("/signin", (req, res) => {
  // TODO: Validar senha criptografada e gerar token JWT para o usuário
  return res
    .status(501)
    .json({ message: "Funcionalidade de login em construção." });
});

module.exports = router;
