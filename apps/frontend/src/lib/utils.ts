import type { WordRecord } from "@/types/dictionary";

// Formata uma data ISO para exibição curta: "16 jun. 2026"
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Formata apenas hora: "14:32"
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Agrupa registros de histórico por período relativo ao dia de hoje.
// Retorna um array ordenado de grupos para renderizar na UI.
export interface HistoryGroup {
  label: string;
  records: WordRecord[];
}

export function groupHistoryByPeriod(records: WordRecord[]): HistoryGroup[] {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const groups: Record<string, WordRecord[]> = {
    Hoje: [],
    Ontem: [],
    "Esta semana": [],
    "Há mais tempo": [],
  };

  for (const record of records) {
    const date = new Date(record.added);

    if (date >= startOfToday) {
      groups["Hoje"].push(record);
    } else if (date >= startOfYesterday) {
      groups["Ontem"].push(record);
    } else if (date >= startOfWeek) {
      groups["Esta semana"].push(record);
    } else {
      groups["Há mais tempo"].push(record);
    }
  }

  // Retorna apenas grupos que têm registros, na ordem correta
  return Object.entries(groups)
    .filter(([, records]) => records.length > 0)
    .map(([label, records]) => ({ label, records }));
}

// Extrai as iniciais do nome para o avatar do header (ex: "Samuel Caetité" → "SC")
export function getInitials(name: string): string {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

// Capitaliza a primeira letra de uma string
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Debounce genérico para o campo de busca
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
