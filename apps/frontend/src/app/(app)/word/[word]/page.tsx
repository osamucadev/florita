"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { dictionaryApi, userApi } from "@/lib/api";
import { WordDetails } from "@/components/ui/WordDetails";
import type { WordDetailsResponse } from "@/types/dictionary";
import { extractErrorMessage } from "@/types/api";

export default function WordPage() {
  const params = useParams();
  const router = useRouter();
  const word = decodeURIComponent(params.word as string);

  const [entries, setEntries] = useState<WordDetailsResponse | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Botão voltar */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-[#625678] hover:text-[#5E00FA] transition-colors duration-200"
        aria-label="Voltar para a página anterior"
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
        Voltar
      </button>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          <div className="space-y-2">
            <div className="h-10 w-48 bg-[#E5DEF5] rounded" />
            <div className="h-4 w-24 bg-[#E5DEF5] rounded" />
          </div>
          <div className="space-y-3">
            <div className="h-3 w-16 bg-[#E5DEF5] rounded" />
            <div className="h-4 w-full bg-[#E5DEF5] rounded" />
            <div className="h-4 w-4/5 bg-[#E5DEF5] rounded" />
            <div className="h-4 w-3/5 bg-[#E5DEF5] rounded" />
          </div>
          <div className="space-y-3">
            <div className="h-3 w-16 bg-[#E5DEF5] rounded" />
            <div className="h-4 w-full bg-[#E5DEF5] rounded" />
            <div className="h-4 w-2/3 bg-[#E5DEF5] rounded" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <p className="text-3xl mb-3">🌑</p>
          <p className="text-sm font-sans text-[#625678] italic max-w-xs mx-auto">
            {error}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-xs font-sans uppercase tracking-widest text-[#5E00FA] hover:underline"
          >
            Voltar
          </button>
        </motion.div>
      )}

      {/* Conteúdo */}
      {entries && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <WordDetails
            entries={entries}
            isFavorited={isFavorited}
            onFavoriteChange={setIsFavorited}
          />
        </motion.div>
      )}
    </div>
  );
}
