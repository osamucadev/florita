"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { extractErrorMessage } from "@/types/api";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export default function SignupPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (field: keyof FieldErrors, value: string) => {
    const errors: FieldErrors = { ...fieldErrors };

    if (field === "name") {
      errors.name =
        value.trim().length < 2
          ? "Nome deve ter ao menos 2 caracteres."
          : undefined;
    }

    if (field === "email") {
      errors.email = !validateEmail(value) ? "E-mail inválido." : undefined;
    }

    if (field === "password") {
      errors.password = !validatePassword(value)
        ? "A senha deve ter 8+ caracteres, uma maiúscula, um número e um caractere especial."
        : undefined;
    }

    setFieldErrors(errors);
  };

  const isFormValid =
    name.trim().length >= 2 &&
    validateEmail(email) &&
    validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setIsLoading(true);

    try {
      const response = await authApi.signup({
        name: name.trim(),
        email,
        password,
      });
      const token = response.token.replace(/^Bearer\s+/i, "");
      login({ id: response.id, name: response.name, token });
      router.push("/home");
    } catch (err) {
      setApiError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-[#F6F4FC] font-serif text-[#1F0A3D]">
      {/* Painel esquerdo - identidade editorial */}
      <div className="flex flex-col justify-between p-8 md:p-16 md:w-1/2 border-b md:border-b-0 md:border-r border-[#E5DEF5] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute w-[700px] h-[700px] border border-[#56FF65] rounded-full -top-40 -left-40" />
          <div className="absolute w-[500px] h-[500px] border border-[#5E00FA] rounded-full top-1/3 -right-20" />
        </div>

        <div className="z-10">
          <span className="text-xs uppercase tracking-[0.2em] font-sans text-[#5E00FA] font-semibold block mb-6">
            Florita
          </span>
          <h1 className="text-4xl lg:text-6xl font-normal leading-tight tracking-tight max-w-md text-[#1F0A3D] lowercase first-letter:uppercase">
            Conecte-se à{" "}
            <span className="italic font-light text-[#56FF65]">geração</span> do
            conhecimento.
          </h1>
        </div>

        <div className="mt-12 md:mt-0 z-10 max-w-sm border-t border-[#E5DEF5] pt-6">
          <p className="text-sm font-sans font-medium text-[#5E00FA] mb-1">
            ge.ra.ção{" "}
            <span className="font-serif italic text-xs text-[#625678]">
              (subst. feminino)
            </span>
          </p>
          <p className="text-sm italic leading-relaxed text-[#625678]">
            S.f. Processo de transformar energia bruta em algo útil e
            sustentável. No Florita, cada palavra aprendida é um crédito gerado.
          </p>
        </div>
      </div>

      {/* Painel direito - formulário */}
      <div className="flex flex-col justify-center items-center p-8 md:p-16 md:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-2xl font-normal tracking-tight text-[#1F0A3D]">
              Criar conta
            </h2>
            <p className="text-sm font-sans text-[#625678] mt-1">
              Preencha os dados para começar a gerar conhecimento.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Nome */}
            <div className="border-b border-[#D2C7EB] pb-2 focus-within:border-[#5E00FA] transition-colors duration-300">
              <label
                htmlFor="name"
                className="block text-xs uppercase tracking-widest font-sans font-semibold text-[#625678]"
              >
                Nome
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => validateField("name", e.target.value)}
                placeholder="Seu nome completo"
                className="mt-2 block w-full bg-transparent border-0 p-0 text-base text-[#1F0A3D] placeholder-[#BFB3DA] focus:ring-0 focus:outline-none font-sans"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-[11px] font-sans text-red-400">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* E-mail */}
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
                onBlur={(e) => validateField("email", e.target.value)}
                placeholder="seu@email.com"
                className="mt-2 block w-full bg-transparent border-0 p-0 text-base text-[#1F0A3D] placeholder-[#BFB3DA] focus:ring-0 focus:outline-none font-sans"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-[11px] font-sans text-red-400">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Senha */}
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
                onBlur={(e) => validateField("password", e.target.value)}
                placeholder="••••••••••••"
                className="mt-2 block w-full bg-transparent border-0 p-0 text-base text-[#1F0A3D] placeholder-[#BFB3DA] focus:ring-0 focus:outline-none font-sans"
              />
              {fieldErrors.password && (
                <p className="mt-1 text-[11px] font-sans text-red-400">
                  {fieldErrors.password}
                </p>
              )}
              {/* Checklist visual de requisitos */}
              {password.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 space-y-1"
                >
                  {[
                    {
                      label: "8 ou mais caracteres",
                      valid: password.length >= 8,
                    },
                    {
                      label: "Uma letra maiúscula",
                      valid: /[A-Z]/.test(password),
                    },
                    { label: "Um número", valid: /[0-9]/.test(password) },
                    {
                      label: "Um caractere especial",
                      valid: /[^A-Za-z0-9]/.test(password),
                    },
                  ].map(({ label, valid }) => (
                    <li
                      key={label}
                      className={`text-[11px] font-sans flex items-center gap-1.5 transition-colors duration-200 ${
                        valid ? "text-[#56FF65]" : "text-[#BFB3DA]"
                      }`}
                    >
                      <span>{valid ? "✓" : "○"}</span>
                      {label}
                    </li>
                  ))}
                </motion.ul>
              )}
            </div>

            {/* Erro da API */}
            {apiError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-sans text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2"
              >
                {apiError}
              </motion.p>
            )}

            <div className="pt-2">
              <motion.button
                whileHover={{ scale: isFormValid ? 1.02 : 1 }}
                whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full flex h-12 items-center justify-center rounded-lg bg-[#5E00FA] text-white font-sans text-sm uppercase tracking-widest font-semibold disabled:opacity-40 transition-colors relative group overflow-hidden shadow-md shadow-[#5E00FA]/20"
              >
                <div className="absolute left-0 top-0 h-full w-1.5 bg-[#56FF65] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {isLoading ? "Criando conta..." : "Criar conta"}
              </motion.button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm font-sans text-[#625678]">
            Já tem uma conta?{" "}
            <Link
              href="/"
              className="text-[#5E00FA] font-medium hover:underline transition-all"
            >
              Entrar
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
