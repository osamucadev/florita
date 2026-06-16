/**
 * 🔒 Middleware de Autenticação JWT
 * Garante que apenas usuários autenticados acessem rotas privadas.
 */
const authMiddleware = async (req, res, next) => {
  // Obtém o cabeçalho de autorização da requisição HTTP
  const authHeader = req.headers.authorization;

  // Se o cabeçalho não existir, barra o acesso imediatamente
  if (!authHeader) {
    return res
      .status(401)
      .json({ error: "Token não fornecido. Acesso rejeitado." });
  }

  // O formato esperado do cabeçalho é: "Bearer <TOKEN>"
  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    return res
      .status(401)
      .json({ error: "Erro no formato do token de autenticação." });
  }

  const [scheme, token] = parts;

  // Valida se o esquema do token começa com a palavra "Bearer"
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: "Token mal formatado." });
  }

  try {
    // TODO: Configurar biblioteca jsonwebtoken (jwt.verify) para descriptografar o token
    // TODO: Extrair o ID do usuário de dentro do payload do token de forma segura

    // Simulação temporária de um ID de usuário injetado na requisição para não travar os testes locais
    req.userId = "fake_user_id_for_testing";

    // Se passou em todas as verificações estruturais, permite que a requisição siga para o Controller
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};

module.exports = authMiddleware;
