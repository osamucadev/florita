"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { userApi, dictionaryApi } from "@/lib/api";
import { capitalize, formatDate } from "@/lib/utils";
import type { PaginatedWordRecords } from "@/types/dictionary";
import { extractErrorMessage } from "@/types/api";

export default function FavoritesPage() {
  const router = useRouter();

  const [data, setData] = useState<PaginatedWordRecords | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [removingWord, setRemovingWord] = useState<string | null>(null);
  const [confirmWord, setConfirmWord] = useState<string | null>(null);

  const fetchFavorites = (p: number) => {
    setIsLoading(true);
    setError(null);

    userApi
      .getFavorites(p, 20)
      .then(setData)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    setTimeout(() => fetchFavorites(1), 0);
  }, []);

  const handlePageChange = (next: number) => {
    setPage(next);
    fetchFavorites(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWordClick = (word: string) => {
    router.push(`/word/${encodeURIComponent(word)}`);
  };

  const handleUnfavoriteRequest = (word: string) => {
    setConfirmWord(word);
  };

  const handleUnfavoriteConfirm = async () => {
    if (!confirmWord) return;
    setRemovingWord(confirmWord);
    setConfirmWord(null);

    try {
      await dictionaryApi.unfavoriteWord(confirmWord);
      // Remove localmente sem precisar refazer o fetch
      setData((prev) =>
        prev
          ? {
              ...prev,
              results: prev.results.filter((r) => r.word !== confirmWord),
              totalDocs: prev.totalDocs - 1,
            }
          : prev,
      );
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setRemovingWord(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] font-sans text-[#5E00FA] font-semibold mb-2">
          Reservatório de termos
        </p>
        <h1 className="text-3xl md:text-4xl font-serif font-normal text-[#1F0A3D] leading-tight">
          Palavras{" "}
          <span className="italic font-light text-[#56FF65]">favoritas</span>.
        </h1>
        <p className="text-sm font-sans text-[#625678] mt-1">
          Seu deck de termos carregados. Clique para ver detalhes.
        </p>
      </div>

      {/* Error state */}
      {error && !isLoading && (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">🌑</p>
          <p className="text-sm font-sans text-[#625678] italic max-w-xs mx-auto">
            Queda de tensão na rede. Não foi possível carregar seus favoritos.
          </p>
          <button
            onClick={() => fetchFavorites(page)}
            className="mt-4 text-xs font-sans uppercase tracking-widest text-[#5E00FA] hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-14 bg-[#E5DEF5] rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && data?.results.length === 0 && (
        <div className="text-center py-16 border border-dashed border-[#D2C7EB] rounded-xl">
          <p className="text-3xl mb-3">🔋</p>
          <p className="text-sm font-sans text-[#625678] italic max-w-xs mx-auto">
            Sua bateria de termos salvos está descarregada. Explore o dicionário
            e favorite palavras para carregar seu deck de estudos.
          </p>
        </div>
      )}

      {/* Lista de favoritos */}
      {!isLoading && !error && data && data.results.length > 0 && (
        <AnimatePresence initial={false}>
          <ul className="space-y-2" aria-label="Lista de palavras favoritas">
            {data.results.map(({ word, added }) => (
              <motion.li
                key={word}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-[#E5DEF5] bg-white group hover:border-[#5E00FA] transition-colors duration-200"
              >
                {/* Palavra e data */}
                <button
                  onClick={() => handleWordClick(word)}
                  className="flex-1 text-left"
                  aria-label={`Ver detalhes de ${word}`}
                >
                  <span className="block text-sm font-sans font-medium text-[#1F0A3D] group-hover:text-[#5E00FA] transition-colors">
                    {capitalize(word)}
                  </span>
                  <span className="block text-[11px] font-sans text-[#BFB3DA] mt-0.5">
                    Adicionado em {formatDate(added)}
                  </span>
                </button>

                {/* Botão de desfavoritar */}
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => handleUnfavoriteRequest(word)}
                  disabled={removingWord === word}
                  aria-label={`Remover ${word} dos favoritos`}
                  className="shrink-0 text-[#BFB3DA] hover:text-red-400 transition-colors duration-200 disabled:opacity-40"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                    />
                  </svg>
                </motion.button>
              </motion.li>
            ))}
          </ul>
        </AnimatePresence>
      )}

      {/* Paginação */}
      {!isLoading && !error && data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[#E5DEF5]">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={!data.hasPrev}
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

          <span className="text-xs font-sans text-[#BFB3DA]">
            {page} de {data.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={!data.hasNext}
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

      {/* Modal de confirmação de remoção */}
      <AnimatePresence>
        {confirmWord && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#1F0A3D]/40 backdrop-blur-sm z-50"
              onClick={() => setConfirmWord(null)}
              aria-hidden="true"
            />
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              role="dialog"
              aria-modal="true"
              aria-label="Confirmar remoção de favorito"
              className="fixed inset-0 flex items-center justify-center z-50 px-4 pointer-events-none"
            >
              <div className="pointer-events-auto bg-[#F6F4FC] rounded-2xl border border-[#E5DEF5] shadow-2xl shadow-[#1F0A3D]/20 p-6 max-w-sm w-full space-y-4">
                <p className="text-sm font-sans text-[#1F0A3D] leading-relaxed">
                  Deseja remover{" "}
                  <span className="font-semibold italic">{confirmWord}</span>{" "}
                  dos seus favoritos?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setConfirmWord(null)}
                    className="text-xs font-sans uppercase tracking-widest text-[#625678] hover:text-[#1F0A3D] transition-colors px-3 py-2"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUnfavoriteConfirm}
                    className="text-xs font-sans uppercase tracking-widest bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-600 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
