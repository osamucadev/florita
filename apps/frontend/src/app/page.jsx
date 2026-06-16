"use client";

import { useState } from "react";
import api from "../services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      setLoading(false);
      return;
    }

    try {
      // TODO: Trocar pela rota real de login quando o signin for finalizado no backend
      // Por enquanto, batemos em /auth/signin que devolve um 501 (Em Construção) para testar o fluxo
      const response = await api.post("/auth/signin", { email, password });

      // TODO: Salvar o token JWT real e dados do usuário no localStorage/Context/Zustand
      // localStorage.setItem('@Florita:token', response.data.token);

      console.log("Login efetuado com sucesso (Mock):", response.data);

      // TODO: Redirecionar o usuário para a Dashboard do Dicionário usando o useRouter() do Next.js
      alert("Login simulado com sucesso!");
    } catch (err) {
      console.error("❌ Erro ao tentar logar:", err);
      // Se o backend devolver uma mensagem tratada, exibimos na tela
      const backendError =
        err.response?.data?.message || err.response?.data?.error;
      setError(
        backendError || "Construção da API: Rota de login em desenvolvimento.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        {/* Cabeçalho do Formulário */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-emerald-600">
            🌸 Florita
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Seu dicionário inteligente de inglês. Faça login para praticar.
          </p>
        </div>

        {/* Alerta de Erro */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 animate-pulse">
            {error}
          </div>
        )}

        {/* Formulário */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md">
            <div>
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Endereço de E-mail
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                placeholder="seu-email@exemplo.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Sua Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Botão de Envio */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg bg-emerald-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-emerald-400 transition-colors"
            >
              {loading ? "Verificando credenciais..." : "Entrar na plataforma"}
            </button>
          </div>
        </form>

        {/* Link para o Cadastro */}
        <div className="text-center text-sm text-gray-600 mt-4">
          Ainda não tem uma conta?{" "}
          <a
            href="/signup"
            className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
          >
            Crie sua conta agora
          </a>
        </div>
      </div>
    </main>
  );
}
