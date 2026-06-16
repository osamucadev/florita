const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Registro de novos usuários (Sign Up)
 * Endpoint: POST /auth/signup
 */
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validação simples dos campos obrigatórios conforme formato exigido (message)
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Por favor, preencha todos os campos (nome, email e senha).",
      });
    }

    // Verifica se já existe um usuário cadastrado com esse e-mail
    const userExists = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (userExists) {
      return res.status(400).json({
        message: "Este e-mail já está em uso por outro usuário.",
      });
    }

    // Cria o usuário — O hook pre-save do User.js cuida da criptografia de forma oculta
    const newUser = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
    });

    // Gerar Token JWT real com expiração de 5 minutos para auditoria do teste
    const token = jwt.sign(
      { id: newUser._id, name: newUser.name },
      process.env.JWT_SECRET || "fallback_secret_flora_2026",
      { expiresIn: "5m" },
    );

    // Retorno de dados no formato EXATO exigido pelo edital (Status 200)
    return res.status(200).json({
      id: newUser._id,
      name: newUser.name,
      token: `Bearer ${token}`,
    });
  } catch (error) {
    console.error(`Erro no fluxo de cadastro: ${error.message}`);
    return res.status(400).json({
      message: "Erro ao processar a requisição de cadastro.",
    });
  }
};

/**
 * Autenticação de usuários (Sign In)
 * Endpoint: POST /auth/signin
 */
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Por favor, preencha os campos de e-mail e senha.",
      });
    }

    // Busca o usuário no banco NoSQL usando o índice de e-mail
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(400).json({
        message: "Credenciais inválidas. Verifique seu e-mail e senha.",
      });
    }

    // Valida a senha usando o método comparePassword embutido no Model
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Credenciais inválidas. Verifique seu e-mail e senha.",
      });
    }

    // Gerar Token JWT idêntico ao do cadastro
    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET || "fallback_secret_flora_2026",
      { expiresIn: "5m" },
    );

    // Retorno de dados no formato EXATO exigido pelo edital (Status 200)
    return res.status(200).json({
      id: user._id,
      name: user.name,
      token: `Bearer ${token}`,
    });
  } catch (error) {
    console.error(`Erro no fluxo de login: ${error.message}`);
    return res.status(400).json({
      message: "Erro ao processar a requisição de autenticação.",
    });
  }
};

module.exports = {
  signup,
  signin,
};
