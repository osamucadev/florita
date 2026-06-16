"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dictionaryApi } from "@/lib/api";
import { WordDetails } from "@/components/ui/WordDetails";
import { userApi } from "@/lib/api";
import type { WordDetailsResponse } from "@/types/dictionary";
import { extractErrorMessage } from "@/types/api";

interface WordModalProps {
  word: string | null;
  onClose: () => void;
}

export function WordModal({ word, onClose }: WordModalProps) {
  const [entries, setEntries] = useState<WordDetailsResponse | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!word) {
      setTimeout(() => {
        setEntries(null);
        setError(null);
      }, 0);
      return;
    }

    setTimeout(() => {
      setIsLoading(true);
      setError(null);
      setEntries(null);

      Promise.all([
        dictionaryApi.getWordDetails(word),
        userApi.getFavorites(1, 100),
      ])
        .then(([details, favorites]) => {
          setEntries(details);
          const isFav = favorites.results.some(
            (f) => f.word === word.toLowerCase(),
          );
          setIsFavorited(isFav);
        })
        .catch((err) => setError(extractErrorMessage(err)))
        .finally(() => setIsLoading(false));
    }, 0);
  }, [word]);

  // Fecha com ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Trava o scroll do body enquanto o modal está aberto
  useEffect(() => {
    if (word) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [word]);

  return (
    <AnimatePresence>
      {word && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#1F0A3D]/40 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Painel do modal */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-label={`Detalhes da palavra: ${word}`}
            className="fixed bottom-0 left-0 right-0 md:inset-0 md:flex md:items-center md:justify-center z-50 pointer-events-none"
          >
            <div className="pointer-events-auto w-full md:max-w-2xl md:mx-4 bg-[#F6F4FC] md:rounded-2xl rounded-t-2xl shadow-2xl shadow-[#1F0A3D]/20 max-h-[90vh] flex flex-col">
              {/* Header do modal */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E5DEF5] shrink-0">
                <span className="text-xs uppercase tracking-[0.2em] font-sans text-[#5E00FA] font-semibold">
                  Definição
                </span>
                <button
                  onClick={onClose}
                  aria-label="Fechar modal"
                  className="text-[#BFB3DA] hover:text-[#1F0A3D] transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Conteúdo scrollável */}
              <div className="overflow-y-auto px-6 py-6 flex-1">
                {/* Loading state */}
                {isLoading && (
                  <div className="space-y-6 animate-pulse">
                    <div className="space-y-2">
                      <div className="h-8 w-40 bg-[#E5DEF5] rounded" />
                      <div className="h-4 w-20 bg-[#E5DEF5] rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-16 bg-[#E5DEF5] rounded" />
                      <div className="h-4 w-full bg-[#E5DEF5] rounded" />
                      <div className="h-4 w-4/5 bg-[#E5DEF5] rounded" />
                      <div className="h-4 w-3/5 bg-[#E5DEF5] rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-16 bg-[#E5DEF5] rounded" />
                      <div className="h-4 w-full bg-[#E5DEF5] rounded" />
                      <div className="h-4 w-2/3 bg-[#E5DEF5] rounded" />
                    </div>
                  </div>
                )}

                {/* Error state */}
                {error && !isLoading && (
                  <div className="text-center py-10">
                    <p className="text-3xl mb-3">🌑</p>
                    <p className="text-sm font-sans text-[#625678] italic max-w-xs mx-auto">
                      {error}
                    </p>
                  </div>
                )}

                {/* Conteúdo */}
                {entries && !isLoading && (
                  <WordDetails
                    entries={entries}
                    isFavorited={isFavorited}
                    onFavoriteChange={setIsFavorited}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
