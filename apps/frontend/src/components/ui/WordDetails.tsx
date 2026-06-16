"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dictionaryApi } from "@/lib/api";
import {
  extractAudioUrl,
  extractPhoneticText,
  extractAllSynonyms,
} from "@/types/dictionary";
import { capitalize } from "@/lib/utils";
import type { WordEntry } from "@/types/dictionary";

interface WordDetailsProps {
  entries: WordEntry[];
  isFavorited: boolean;
  onFavoriteChange?: (favorited: boolean) => void;
}

export function WordDetails({
  entries,
  isFavorited,
  onFavoriteChange,
}: WordDetailsProps) {
  const [favorited, setFavorited] = useState(isFavorited);
  const [isFavoriting, setIsFavoriting] = useState(false);

  // Usa a primeira entrada como principal
  const primary = entries[0];
  const phoneticText = extractPhoneticText(primary);
  const audioUrl = extractAudioUrl(primary.phonetics);
  const allSynonyms = extractAllSynonyms(primary);

  const handleFavoriteToggle = async () => {
    if (isFavoriting) return;
    setIsFavoriting(true);

    const next = !favorited;

    try {
      if (next) {
        await dictionaryApi.favoriteWord(primary.word);
      } else {
        await dictionaryApi.unfavoriteWord(primary.word);
      }
      setFavorited(next);
      onFavoriteChange?.(next);
    } catch {
      // Não altera o estado se falhar
    } finally {
      setIsFavoriting(false);
    }
  };

  const playAudio = () => {
    if (!audioUrl) return;
    new Audio(audioUrl).play().catch(() => null);
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho da palavra */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif font-normal text-[#1F0A3D] lowercase">
            {primary.word}
          </h2>

          {/* Fonética */}
          {phoneticText && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-sans text-[#625678] italic">
                {phoneticText}
              </span>
              {audioUrl && (
                <button
                  onClick={playAudio}
                  aria-label="Ouvir pronúncia"
                  className="text-[#BFB3DA] hover:text-[#5E00FA] transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Botão de favoritar */}
        <motion.button
          onClick={handleFavoriteToggle}
          disabled={isFavoriting}
          aria-label={
            favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"
          }
          whileTap={{ scale: 0.88 }}
          animate={{ scale: favorited ? [1, 1.15, 1] : 1 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 mt-1 disabled:opacity-50"
        >
          <svg
            className={`w-6 h-6 transition-colors duration-300 ${
              favorited
                ? "text-[#5E00FA] fill-[#5E00FA]"
                : "text-[#BFB3DA] fill-transparent"
            }`}
            stroke="currentColor"
            strokeWidth={1.5}
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
      </div>

      {/* Significados */}
      <div className="space-y-6">
        {primary.meanings.map((meaning, mi) => (
          <div key={mi}>
            {/* Classe gramatical */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs uppercase tracking-widest font-sans font-semibold text-[#5E00FA]">
                {meaning.partOfSpeech}
              </span>
              <div className="flex-1 h-px bg-[#E5DEF5]" />
            </div>

            {/* Definições */}
            <ol className="space-y-3">
              {meaning.definitions.map((def, di) => (
                <li key={di} className="flex gap-3">
                  <span className="text-xs font-sans text-[#BFB3DA] mt-0.5 shrink-0 w-4">
                    {di + 1}.
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-sans text-[#1F0A3D] leading-relaxed">
                      {def.definition}
                    </p>
                    {def.example && (
                      <p className="text-sm font-sans italic text-[#625678]">
                        &quot;{def.example}&quot;
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            {/* Sinônimos do meaning */}
            {meaning.synonyms.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {meaning.synonyms.slice(0, 6).map((syn) => (
                  <span
                    key={syn}
                    className="text-[11px] font-sans px-2 py-0.5 rounded-full border border-[#E5DEF5] text-[#625678]"
                  >
                    {syn}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sinônimos agregados de todas as entradas */}
      {allSynonyms.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest font-sans font-semibold text-[#BFB3DA] mb-3">
            Sinônimos
          </p>
          <div className="flex flex-wrap gap-2">
            {allSynonyms.slice(0, 12).map((syn) => (
              <span
                key={syn}
                className="text-xs font-sans px-3 py-1 rounded-full bg-[#F6F4FC] border border-[#E5DEF5] text-[#625678] hover:border-[#5E00FA] hover:text-[#5E00FA] transition-colors cursor-default"
              >
                {capitalize(syn)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Múltiplas entradas - entradas adicionais colapsadas */}
      {entries.length > 1 && <AdditionalEntries entries={entries.slice(1)} />}
    </div>
  );
}

function AdditionalEntries({ entries }: { entries: WordEntry[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-[#E5DEF5] pt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs uppercase tracking-widest font-sans font-semibold text-[#BFB3DA] hover:text-[#5E00FA] transition-colors flex items-center gap-2"
      >
        <span>
          {open ? "Ocultar" : "Ver"} entradas adicionais ({entries.length})
        </span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-6">
              {entries.map((entry, ei) => (
                <div key={ei} className="space-y-3">
                  {entry.meanings.map((meaning, mi) => (
                    <div key={mi}>
                      <span className="text-xs uppercase tracking-widest font-sans font-semibold text-[#5E00FA]">
                        {meaning.partOfSpeech}
                      </span>
                      <ol className="mt-2 space-y-2">
                        {meaning.definitions.map((def, di) => (
                          <li key={di} className="flex gap-3">
                            <span className="text-xs font-sans text-[#BFB3DA] mt-0.5 shrink-0 w-4">
                              {di + 1}.
                            </span>
                            <p className="text-sm font-sans text-[#1F0A3D] leading-relaxed">
                              {def.definition}
                            </p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
