const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Segredo lido uma vez, sem fallback: se a env não existir, o app falha no
// boot em vez de assinar tokens com uma chave conhecida. (Igual ao middleware.)
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET não definido nas variáveis de ambiente. Configure-o antes de iniciar a API.",
  );
}

// Expiração configurável via ambiente (a env JWT_EXPIRATION já existe no compose).
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "1h";

// Centraliza a emissão do token para signup e signin permanecerem idênticos.
const generateToken = (user) =>
  jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });

/**
 * Registro de novos usuários (Sign Up)
 * Endpoint: POST /auth/signup
 */
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validação simples dos campos obrigatórios
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Por favor, preencha todos os campos (nome, email e senha).",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verifica se já existe um usuário cadastrado com esse e-mail
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({
        message: "Este e-mail já está em uso por outro usuário.",
      });
    }

    // Cria o usuário — o hook pre-save do User.js cuida da criptografia da senha
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    const token = generateToken(newUser);

    return res.status(200).json({
      id: newUser._id,
      name: newUser.name,
      token: `Bearer ${token}`,
    });
  } catch (error) {
    console.error(`Erro no fluxo de cadastro: ${error.message}`);

    // Índice único barrou um e-mail duplicado (corrida entre o findOne e o create)
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Este e-mail já está em uso por outro usuário.",
      });
    }

    // Falha de validação do schema (ex.: formato de e-mail inválido) é erro do cliente
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
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

    // Busca o usuário no banco usando o índice de e-mail
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

    const token = generateToken(user);

    return res.status(200).json({
      id: user._id,
      name: user.name,
      token: `Bearer ${token}`,
    });
  } catch (error) {
    console.error(`Erro no fluxo de login: ${error.message}`);
    return res.status(500).json({
      message: "Erro ao processar a requisição de autenticação.",
    });
  }
};

module.exports = {
  signup,
  signin,
};
