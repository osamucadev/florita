const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     summary: Cadastro de novos usuários
 *     description: Cria uma nova conta no sistema e retorna um token de acesso de 5 minutos pronto para uso.
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Samuel Caetité"
 *               email:
 *                 type: string
 *                 example: "srcaetite@gmail.com"
 *               password:
 *                 type: string
 *                 example: "SenhaSegura@2026"
 *     responses:
 *       200:
 *         description: Usuário criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "65f12a3b4c5d6e7f8a9b0c1d"
 *                 name:
 *                   type: string
 *                   example: "Samuel Caetité"
 *                 token:
 *                   type: string
 *                   example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Falha de validação ou e-mail já cadastrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Este e-mail já está em uso por outro usuário."
 */
router.post("/signup", authController.signup);

/**
 * @openapi
 * /auth/signin:
 *   post:
 *     summary: Autenticação de usuário (Login)
 *     description: Valida as credenciais do usuário e gera um token JWT de acesso.
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "srcaetite@gmail.com"
 *               password:
 *                 type: string
 *                 example: "SenhaSegura@2026"
 *     responses:
 *       200:
 *         description: Login efetuado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "65f12a3b4c5d6e7f8a9b0c1d"
 *                 name:
 *                   type: string
 *                   example: "Samuel Caetité"
 *                 token:
 *                   type: string
 *                   example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Credenciais incorretas ou campos vazios.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Credenciais inválidas. Verifique seu e-mail e senha."
 */
router.post("/signin", authController.signin);

module.exports = router;
