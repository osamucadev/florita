"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { dictionaryApi, userApi } from "@/lib/api";
import { groupHistoryByPeriod, capitalize } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import type { EntriesResponse, PaginatedWordRecords } from "@/types/dictionary";
import { extractErrorMessage } from "@/types/api";

export default function HomePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [history, setHistory] = useState<PaginatedWordRecords | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carrega histórico recente ao montar
  useEffect(() => {
    userApi
      .getHistory(1, 30)
      .then(setHistory)
      .catch((err) => setHistoryError(extractErrorMessage(err)))
      .finally(() => setIsHistoryLoading(false));
  }, []);

  // Busca sugestões com debounce manual via useRef
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!query.trim()) {
      debounceTimer.current = setTimeout(() => {
        setSuggestions([]);
        setShowSuggestions(false);
      }, 0);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsSuggestionsLoading(true);
      try {
        const data: EntriesResponse = await dictionaryApi.getEntries({
          search: query,
          limit: 8,
        });
        setSuggestions(data.results);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSuggestionsLoading(false);
      }
    }, 350);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  const handleWordClick = (word: string) => {
    setShowSuggestions(false);
    setQuery("");
    router.push(`/word/${encodeURIComponent(word)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleWordClick(suggestions[0]);
    }
  };

  const groups = history ? groupHistoryByPeriod(history.results) : [];

  return (
    <div className="space-y-12">
      {/* Saudação */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] font-sans text-[#5E00FA] font-semibold mb-2">
          Painel de geração
        </p>
        <h1 className="text-3xl md:text-4xl font-serif font-normal text-[#1F0A3D] leading-tight">
          Olá,{" "}
          <span className="italic font-light text-[#5E00FA]">
            {user?.name.split(" ")[0]}
          </span>
          .
        </h1>
        <p className="text-sm font-sans text-[#625678] mt-1">
          Pesquise uma palavra para gerar seu próximo crédito de conhecimento.
        </p>
      </div>

      {/* Campo de busca */}
      <div className="relative">
        <form onSubmit={handleSearchSubmit}>
          <div
            className="flex items-center border-b-2 border-[#D2C7EB] focus-within:border-[#5E00FA] transition-colors duration-300 pb-3 gap-4"
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
          >
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
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Digite uma palavra em inglês..."
              className="flex-1 bg-transparent border-0 p-0 text-lg font-sans text-[#1F0A3D] placeholder-[#BFB3DA] focus:ring-0 focus:outline-none"
              aria-label="Buscar palavra"
              aria-autocomplete="list"
              aria-controls="suggestions-listbox"
            />
            {isSuggestionsLoading && (
              <span className="text-[11px] font-sans text-[#BFB3DA] uppercase tracking-widest shrink-0">
                Buscando...
              </span>
            )}
          </div>
        </form>

        {/* Dropdown de sugestões */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5DEF5] rounded-lg shadow-lg shadow-[#5E00FA]/5 overflow-hidden z-30"
              role="listbox"
              aria-label="Sugestões de palavras"
            >
              {suggestions.map((word) => (
                <li key={word} role="option" aria-selected={false}>
                  <button
                    onMouseDown={() => handleWordClick(word)}
                    className="w-full text-left px-4 py-3 text-sm font-sans text-[#1F0A3D] hover:bg-[#F6F4FC] hover:text-[#5E00FA] transition-colors duration-150 flex items-center justify-between group"
                  >
                    <span>{word}</span>
                    <span className="text-[10px] uppercase tracking-widest text-[#BFB3DA] group-hover:text-[#5E00FA] transition-colors">
                      Ver definição
                    </span>
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Histórico recente */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] font-sans text-[#5E00FA] font-semibold mb-6">
          Histórico de geração
        </p>

        {/* Loading state */}
        {isHistoryLoading && (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-3 w-24 bg-[#E5DEF5] rounded animate-pulse" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div
                      key={j}
                      className="h-9 bg-[#E5DEF5] rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {historyError && !isHistoryLoading && (
          <div className="text-center py-10">
            <p className="text-2xl mb-2">🌑</p>
            <p className="text-sm font-sans text-[#625678] italic">
              Queda de tensão na rede. Não foi possível carregar seu histórico.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isHistoryLoading && !historyError && groups.length === 0 && (
          <div className="text-center py-10 border border-dashed border-[#D2C7EB] rounded-xl">
            <p className="text-3xl mb-3">☀️</p>
            <p className="text-sm font-sans text-[#625678] italic max-w-xs mx-auto">
              Céu limpo e sem registros por aqui. Pesquise uma palavra para
              gerar seus primeiros créditos de conhecimento.
            </p>
          </div>
        )}

        {/* Grupos de histórico */}
        {!isHistoryLoading && !historyError && groups.length > 0 && (
          <div className="space-y-8">
            {groups.map(({ label, records }) => (
              <div key={label}>
                <p className="text-[11px] uppercase tracking-widest font-sans font-semibold text-[#BFB3DA] mb-3">
                  {label}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {records.map(({ word, added }) => (
                    <motion.button
                      key={`${word}-${added}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleWordClick(word)}
                      className="text-left px-3 py-2.5 rounded-lg border border-[#E5DEF5] bg-white hover:border-[#5E00FA] hover:text-[#5E00FA] transition-all duration-200 group"
                    >
                      <span className="block text-sm font-sans text-[#1F0A3D] group-hover:text-[#5E00FA] transition-colors truncate">
                        {capitalize(word)}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
