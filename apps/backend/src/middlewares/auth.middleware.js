const jwt = require("jsonwebtoken");

// Lê o segredo UMA vez, no carregamento do módulo.
// Sem fallback: se a env não existir, o app falha no boot em vez de
// subir assinando tokens com uma chave conhecida (publicada no repo).
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET não definido nas variáveis de ambiente. Configure-o antes de iniciar a API.",
  );
}

/**
 * Middleware de Autenticação JWT
 * Garante que apenas usuários autenticados acessem rotas privadas.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Se o cabeçalho não existir, barra o acesso imediatamente
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

  // Valida se o esquema do token é "Bearer" (case-insensitive)
  if (!/^Bearer$/i.test(scheme)) {
    return res
      .status(401)
      .json({ message: "Token de autenticação mal formatado." });
  }

  try {
    // Validação real do JWT usando a assinatura do sistema
    const decoded = jwt.verify(token, JWT_SECRET);

    // Injeta os dados extraídos do payload no objeto da requisição (req),
    // disponibilizando-os para qualquer Controller posterior.
    req.userId = decoded.id;
    req.userName = decoded.name;

    return next();
  } catch (error) {
    // Captura token expirado ou assinatura violada
    console.error(`⚠️ Falha na verificação do JWT: ${error.message}`);
    return res
      .status(401)
      .json({ message: "Sessão inválida ou expirada. Faça login novamente." });
  }
};

module.exports = authMiddleware;
