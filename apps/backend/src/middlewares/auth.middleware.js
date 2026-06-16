const jwt = require("jsonwebtoken");

/**
 * Middleware de Autenticação JWT
 * Garante que apenas usuários autenticados acessem rotas privadas.
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Se o cabeçalho não existir, barra o acesso imediatamente no padrão (message)
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Token de autenticação não fornecido." });
  }

  // O formato esperado do cabeçalho é: "Bearer <TOKEN>"
  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    return res
      .status(401)
      .json({ message: "Formato do token de autenticação inválido." });
  }

  const [scheme, token] = parts;

  // Valida se o esquema do token começa com a palavra "Bearer"
  if (!/^Bearer$/i.test(scheme)) {
    return res
      .status(401)
      .json({ message: "Token de autenticação mal formatado." });
  }

  try {
    // Validação Real do JWT usando a assinatura do sistema
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret_flora_2026",
    );

    // Injeta o ID e o Nome extraídos do payload diretamente no objeto da requisição (req)
    // Isso deixa esses dados disponíveis para qualquer Controller que venha depois do middleware
    req.userId = decoded.id;
    req.userName = decoded.name;

    // Permite que a requisição siga para o próximo interceptor ou Controller
    return next();
  } catch (error) {
    // Captura token expirado (as regras de 5 minutos) ou assinaturas violadas
    console.error(`⚠️ Falha na verificação do JWT: ${error.message}`);
    return res
      .status(401)
      .json({ message: "Sessão inválida ou expirada. Faça login novamente." });
  }
};

module.exports = authMiddleware;
