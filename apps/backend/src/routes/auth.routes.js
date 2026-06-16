const express = require("express");
const router = express.Router();

// Importamos as funções do nosso controller
const authController = require("../controllers/authController");

// Vincula a rota pública de cadastro ao método do controller
router.post("/signup", authController.signup);

// Vincula a rota de login (em construção)
router.post("/signin", authController.signin);

module.exports = router;
