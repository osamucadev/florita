//  Free Dictionary API 
// Modelado a partir dos contratos reais observados:
//   - /entries/en/test     → array com múltiplas entradas
//   - /entries/en/t-shirt  → phonetics vazio, sem phonetic raiz
//   - /entries/en/aaa      → synonyms no nível do meaning E na definition
//   - /entries/en/xxxxx    → 404 com objeto { title, message, resolution }

export interface PhoneticAudioLicense {
  name: string;
  url: string;
}

export interface Phonetic {
  text?: string;
  audio?: string;
  sourceUrl?: string;
  license?: PhoneticAudioLicense;
}

export interface Definition {
  definition: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

export interface DictionaryLicense {
  name: string;
  url: string;
}

// Uma entrada da palavra (a API pode retornar múltiplas por palavra)
export interface WordEntry {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  license: DictionaryLicense;
  sourceUrls: string[];
}

// Resposta de sucesso: sempre um array de entradas
export type WordDetailsResponse = WordEntry[];

// Resposta de erro 404 da Free Dictionary API
export interface WordNotFoundError {
  title: string;
  message: string;
  resolution: string;
}

// Helper: checa se a resposta é um erro (objeto) ou sucesso (array)
export function isWordNotFoundError(
  data: WordDetailsResponse | WordNotFoundError,
): data is WordNotFoundError {
  return !Array.isArray(data) && "title" in data;
}

// Listagem paginada por cursor (backend Florita) 

export interface EntriesResponse {
  results: string[];
  totalDocs: number;
  previous: string | null;
  next: string | null;
  hasNext: boolean;
  hasPrev: boolean;
}

// Histórico e Favoritos 

export interface WordRecord {
  word: string;
  added: string; // ISO 8601 timestamp
}

export interface PaginatedWordRecords {
  results: WordRecord[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Helpers de UI 

// Extrai o primeiro áudio disponível de um array de phonetics
export function extractAudioUrl(phonetics: Phonetic[]): string | null {
  const withAudio = phonetics.find((p) => p.audio && p.audio.trim() !== "");
  return withAudio?.audio ?? null;
}

// Extrai a fonética textual: prioriza a string raiz, depois o primeiro phonetic com texto
export function extractPhoneticText(entry: WordEntry): string | null {
  if (entry.phonetic) return entry.phonetic;
  const withText = entry.phonetics.find((p) => p.text && p.text.trim() !== "");
  return withText?.text ?? null;
}

// Agrega todos os sinônimos únicos de uma entrada (nível meaning + nível definition)
export function extractAllSynonyms(entry: WordEntry): string[] {
  const set = new Set<string>();
  for (const meaning of entry.meanings) {
    meaning.synonyms.forEach((s) => set.add(s));
    for (const def of meaning.definitions) {
      def.synonyms.forEach((s) => set.add(s));
    }
  }
  return Array.from(set);
}
