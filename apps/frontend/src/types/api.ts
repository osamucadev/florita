// Autenticação 

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

// Resposta de signup e signin é idêntica no backend Florita
export interface AuthResponse {
  id: string;
  name: string;
  token: string; // formato: "Bearer <JWT>"
}

// Perfil do usuário 

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string; // ISO 8601
}

// Estado global de autenticação (usado pelo Zustand) 

export interface AuthUser {
  id: string;
  name: string;
  token: string; // JWT puro, sem o prefixo "Bearer "
}

// Erros da API Florita 

export interface ApiError {
  message: string;
}

// Helper: extrai a mensagem de erro de qualquer resposta de falha
export function extractErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
  ) {
    return (error as ApiError).message;
  }
  return "Ocorreu um erro inesperado. Tente novamente.";
}
