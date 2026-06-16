"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { extractErrorMessage } from "@/types/api";

const REASON_MESSAGES: Record<string, string> = {
  inactivity: "Sua sessão expirou por inatividade. Faça login novamente.",
  expired: "Sua sessão foi encerrada. Faça login novamente.",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);

  const reason = searchParams.get("reason");
  const sessionMessage = reason ? (REASON_MESSAGES[reason] ?? null) : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.signin({ email, password });
      const token = response.token.replace(/^Bearer\s+/i, "");
      login({ id: response.id, name: response.name, token });
      router.push("/home");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-[#F6F4FC] font-serif text-[#1F0A3D]">
      {/* Painel esquerdo - identidade editorial */}
      <div className="flex flex-col justify-between p-8 md:p-16 md:w-1/2 border-b md:border-b-0 md:border-r border-[#E5DEF5] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute w-[700px] h-[700px] border border-[#5E00FA] rounded-full -top-40 -left-40" />
          <div className="absolute w-[500px] h-[500px] border border-[#56FF65] rounded-full top-1/3 -right-20" />
        </div>

        <div className="z-10">
          <span className="text-xs uppercase tracking-[0.2em] font-sans text-[#5E00FA] font-semibold block mb-6">
            Florita
          </span>
          <h1 className="text-4xl lg:text-6xl font-normal leading-tight tracking-tight max-w-md text-[#1F0A3D] lowercase first-letter:uppercase">
            A linguagem da{" "}
            <span className="italic font-light text-[#5E00FA]">energia</span>{" "}
            limpa.
          </h1>
        </div>

        <div className="mt-12 md:mt-0 z-10 max-w-sm border-t border-[#E5DEF5] pt-6">
          <p className="text-sm font-sans font-medium text-[#5E00FA] mb-1">
            flo.ri.ta{" "}
            <span className="font-serif italic text-xs text-[#625678]">
              (subst. próprio)
            </span>
          </p>
          <p className="text-sm italic leading-relaxed text-[#625678]">
            S.f. Pesquise, salve e revise termos técnicos em inglês. Seu
            histórico de consultas sempre à mão.
          </p>
        </div>
      </div>

      {/* Painel direito - formulário */}
      <div className="flex flex-col justify-center items-center p-8 md:p-16 md:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-2xl font-normal tracking-tight text-[#1F0A3D]">
              Acessar plataforma
            </h2>
            <p className="text-sm font-sans text-[#625678] mt-1">
              Entre com suas credenciais para continuar.
            </p>
          </div>

          {/* Aviso de sessão expirada */}
          <AnimatePresence>
            {sessionMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 text-xs font-sans text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-4 py-3 leading-relaxed"
              >
                {sessionMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="border-b border-[#D2C7EB] pb-2 focus-within:border-[#5E00FA] transition-colors duration-300">
              <label
                htmlFor="email"
                className="block text-xs uppercase tracking-widest font-sans font-semibold text-[#625678]"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="mt-2 block w-full bg-transparent border-0 p-0 text-base text-[#1F0A3D] placeholder-[#BFB3DA] focus:ring-0 focus:outline-none font-sans"
              />
            </div>

            <div className="border-b border-[#D2C7EB] pb-2 focus-within:border-[#5E00FA] transition-colors duration-300">
              <label
                htmlFor="password"
                className="block text-xs uppercase tracking-widest font-sans font-semibold text-[#625678]"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="mt-2 block w-full bg-transparent border-0 p-0 text-base text-[#1F0A3D] placeholder-[#BFB3DA] focus:ring-0 focus:outline-none font-sans"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-sans text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full flex h-12 items-center justify-center rounded-lg bg-[#5E00FA] text-white font-sans text-sm uppercase tracking-widest font-semibold disabled:opacity-50 transition-colors relative group overflow-hidden shadow-md shadow-[#5E00FA]/20"
              >
                <div className="absolute left-0 top-0 h-full w-1.5 bg-[#56FF65] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {isLoading ? "Entrando..." : "Entrar"}
              </motion.button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm font-sans text-[#625678]">
            Ainda não tem conta?{" "}
            <Link
              href="/signup"
              className="text-[#5E00FA] font-medium hover:underline transition-all"
            >
              Criar conta
            </Link>
          </p>

          <div className="mt-16 flex justify-between items-center text-[10px] font-sans uppercase tracking-widest text-[#BFB3DA] border-t border-[#E5DEF5] pt-4">
            <span className="font-bold text-[#56FF65]">Flora Energia</span>
            <span>FLR-2026 v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
