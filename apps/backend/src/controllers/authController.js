const User = require("../models/User");

/**
 * 📝 Registro de novos usuários (Sign Up)
 */
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validação simples dos campos obrigatórios
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({
          error: "Por favor, preencha todos os campos (nome, email e senha).",
        });
    }

    // Verifica se já existe um usuário cadastrado com esse e-mail
    const userExists = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (userExists) {
      return res
        .status(400)
        .json({ error: "Este e-mail já está em uso por outro usuário." });
    }

    // TODO: Criar criptografia de senha usando bcrypt antes de salvar no banco
    // Por enquanto, salvamos a senha em formato raw text para não travar os testes do Front
    const newUser = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password, // TODO: hashPassword aqui na refatoração
    });

    // TODO: Gerar e retornar um Token JWT real para o usuário já logar direto após o cadastro
    const fakeToken = "fake_jwt_token_for_frontend_integration";

    // Retorna os dados do usuário criado (omitindo a senha por segurança)
    return res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
      token: fakeToken,
    });
  } catch (error) {
    console.error(`❌ Erro no fluxo de cadastro: ${error.message}`);
    return res
      .status(500)
      .json({ error: "Erro interno do servidor ao processar o cadastro." });
  }
};

/**
 * 🔑 Autenticação de usuários (Sign In)
 */
const signin = async (req, res) => {
  // TODO: Implementar fluxo de login validando a senha criptografada e gerando o JWT
  return res
    .status(501)
    .json({ message: "Funcionalidade de login em construção." });
};

module.exports = {
  signup,
  signin,
};
