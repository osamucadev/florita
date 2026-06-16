"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dictionaryApi } from "@/lib/api";
import { WordModal } from "@/components/ui/WordModal";
import { capitalize } from "@/lib/utils";
import type { EntriesResponse } from "@/types/dictionary";
import { extractErrorMessage } from "@/types/api";

export default function DictionaryPage() {
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<EntriesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEntries = (
    search: string,
    next?: string | null,
    previous?: string | null,
  ) => {
    setIsLoading(true);
    setError(null);

    dictionaryApi
      .getEntries({ search: search || undefined, limit: 40, next, previous })
      .then(setEntries)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  // Carga inicial
  useEffect(() => {
    setTimeout(() => fetchEntries(""), 0);
  }, []);

  // Busca com debounce
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      fetchEntries(query);
    }, 350);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  const handleNext = () => {
    if (entries?.next) fetchEntries(query, entries.next, null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    if (entries?.previous) fetchEntries(query, null, entries.previous);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] font-sans text-[#5E00FA] font-semibold mb-2">
          Banco de termos
        </p>
        <h1 className="text-3xl md:text-4xl font-serif font-normal text-[#1F0A3D] leading-tight">
          Dicionário{" "}
          <span className="italic font-light text-[#5E00FA]">completo</span>.
        </h1>
        <p className="text-sm font-sans text-[#625678] mt-1">
          Clique em qualquer palavra para ver sua definição.
        </p>
      </div>

      {/* Campo de busca */}
      <div className="flex items-center border-b-2 border-[#D2C7EB] focus-within:border-[#5E00FA] transition-colors duration-300 pb-3 gap-4">
        <svg
          className="w-5 h-5 text-[#BFB3DA] shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtrar palavras..."
          className="flex-1 bg-transparent border-0 p-0 text-base font-sans text-[#1F0A3D] placeholder-[#BFB3DA] focus:ring-0 focus:outline-none"
          aria-label="Filtrar palavras do dicionário"
        />
        {isLoading && (
          <span className="text-[11px] font-sans text-[#BFB3DA] uppercase tracking-widest shrink-0">
            Carregando...
          </span>
        )}
      </div>

      {/* Total de resultados */}
      {entries && !isLoading && (
        <p className="text-xs font-sans text-[#BFB3DA] uppercase tracking-widest">
          {entries.totalDocs.toLocaleString("pt-BR")} termos encontrados
        </p>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">🌑</p>
          <p className="text-sm font-sans text-[#625678] italic max-w-xs mx-auto">
            Queda de tensão na rede. Não foi possível carregar os termos.
          </p>
          <button
            onClick={() => fetchEntries(query)}
            className="mt-4 text-xs font-sans uppercase tracking-widest text-[#5E00FA] hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="h-10 bg-[#E5DEF5] rounded-lg animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && entries?.results.length === 0 && (
        <div className="text-center py-16 border border-dashed border-[#D2C7EB] rounded-xl">
          <p className="text-3xl mb-3">🔋</p>
          <p className="text-sm font-sans text-[#625678] italic max-w-xs mx-auto">
            Nenhum termo encontrado para &quot;{query}&quot;. Tente outro
            prefixo.
          </p>
        </div>
      )}

      {/* Grid de palavras */}
      {!isLoading && !error && entries && entries.results.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={entries.next ?? "first"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-2"
          >
            {entries.results.map((word) => (
              <motion.button
                key={word}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedWord(word)}
                className="text-left px-3 py-2.5 rounded-lg border border-[#E5DEF5] bg-white hover:border-[#5E00FA] hover:text-[#5E00FA] transition-all duration-200 group"
              >
                <span className="block text-sm font-sans text-[#1F0A3D] group-hover:text-[#5E00FA] transition-colors truncate">
                  {capitalize(word)}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Paginação por cursor */}
      {!isLoading &&
        !error &&
        entries &&
        (entries.hasPrev || entries.hasNext) && (
          <div className="flex items-center justify-between pt-4 border-t border-[#E5DEF5]">
            <button
              onClick={handlePrevious}
              disabled={!entries.hasPrev}
              className="text-xs font-sans uppercase tracking-widest text-[#625678] hover:text-[#5E00FA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Anterior
            </button>

            <button
              onClick={handleNext}
              disabled={!entries.hasNext}
              className="text-xs font-sans uppercase tracking-widest text-[#625678] hover:text-[#5E00FA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              Próximo
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}

      {/* Modal de detalhes */}
      <WordModal word={selectedWord} onClose={() => setSelectedWord(null)} />
    </div>
  );
}
