"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("Autenticando na Flora Energia:", { email, password });

    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-[#F6F4FC] font-serif text-[#1F0A3D]">
      <div className="flex flex-col justify-between p-8 md:p-16 md:w-1/2 border-b md:border-b-0 md:border-r border-[#E5DEF5] relative overflow-hidden bg-[#F6F4FC]">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute w-[700px] h-[700px] border border-[#5E00FA] rounded-full -top-40 -left-40" />
          <div className="absolute w-[500px] h-[500px] border border-[#56FF65] rounded-full top-1/3 -right-20" />
        </div>

        <div className="z-10">
          <span className="text-xs uppercase tracking-[0.2em] font-sans text-[#5E00FA] font-semibold block mb-6">
            — Florita
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
            S.m. Ecossistema inteligente de tradução, termos e dados técnicos
            moldados para a infraestrutura de geração renovável da Flora.
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center p-8 md:p-16 md:w-1/2 bg-[#F6F4FC]">
        <div className="w-full max-w-sm flex flex-col justify-center">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-2xl font-normal tracking-tight text-[#1F0A3D]">
              Acessar plataforma
            </h2>
            <p className="text-sm font-sans text-[#625678] mt-1">
              Conecte-se ao painel de tradução e dados da Flora.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="border-b border-[#D2C7EB] pb-2 focus-within:border-[#5E00FA] transition-colors duration-300">
              <label
                htmlFor="email"
                className="block text-xs uppercase tracking-widest font-sans font-semibold text-[#625678]"
              >
                Identificação do Usuário
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.nome@floraenergia.com.br"
                className="mt-2 block w-full bg-transparent border-0 p-0 text-base text-[#1F0A3D] placeholder-[#BFB3DA] focus:ring-0 focus:outline-none font-sans"
              />
            </div>

            <div className="border-b border-[#D2C7EB] pb-2 focus-within:border-[#5E00FA] transition-colors duration-300">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs uppercase tracking-widest font-sans font-semibold text-[#625678]"
                >
                  Chave Criptografada
                </label>
                <a
                  href="#"
                  className="text-xs font-sans text-[#5E00FA] font-medium hover:underline transition-all"
                >
                  Recuperar chave
                </a>
              </div>
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

            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "#4a00c7" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full flex h-12 items-center justify-center rounded-lg bg-[#5E00FA] text-white font-sans text-sm uppercase tracking-widest font-semibold disabled:opacity-50 transition-all shadow-md shadow-[#5E00FA]/10 relative group overflow-hidden"
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-[#56FF65] opacity-0 group-hover:opacity-100 transition-opacity" />
                {isLoading ? "Processando Registro..." : "Autenticar Entrada"}
              </motion.button>
            </div>
          </form>
          <div className="mt-16 flex justify-between items-center text-[10px] font-sans uppercase tracking-widest text-[#BFB3DA] border-t border-[#E5DEF5] pt-4">
            <span className="font-bold text-[#5E00FA]">Flora Energia</span>
            <span>FLR-2026 v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
