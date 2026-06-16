import type {
  SignUpPayload,
  SignInPayload,
  AuthResponse,
  UserProfile,
} from "@/types/api";
import type {
  WordDetailsResponse,
  EntriesResponse,
  PaginatedWordRecords,
} from "@/types/dictionary";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

// Lê o token do localStorage e monta o header Authorization
function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("florita_token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

// Wrapper base para todas as requisições
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
      ...options.headers,
    },
  });

  // 204 não tem corpo
  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json();

  if (!res.ok) {
    // Lança o objeto de erro para o chamador tratar com extractErrorMessage
    throw data;
  }

  return data as T;
}

// Auth
export const authApi = {
  signup(payload: SignUpPayload): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  signin(payload: SignInPayload): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/signin", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

// Usuário
export const userApi = {
  getMe(): Promise<UserProfile> {
    return request<UserProfile>("/user/me");
  },

  getHistory(page = 1, limit = 20): Promise<PaginatedWordRecords> {
    return request<PaginatedWordRecords>(
      `/user/me/history?page=${page}&limit=${limit}`,
    );
  },

  getFavorites(page = 1, limit = 20): Promise<PaginatedWordRecords> {
    return request<PaginatedWordRecords>(
      `/user/me/favorites?page=${page}&limit=${limit}`,
    );
  },
};

// Dicionário
export const dictionaryApi = {
  getEntries(params: {
    search?: string;
    limit?: number;
    next?: string | null;
    previous?: string | null;
  }): Promise<EntriesResponse> {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.next) query.set("next", params.next);
    if (params.previous) query.set("previous", params.previous);

    return request<EntriesResponse>(`/entries/en?${query.toString()}`);
  },

  getWordDetails(word: string): Promise<WordDetailsResponse> {
    return request<WordDetailsResponse>(
      `/entries/en/${encodeURIComponent(word)}`,
    );
  },

  favoriteWord(word: string): Promise<void> {
    return request<void>(`/entries/en/${encodeURIComponent(word)}/favorite`, {
      method: "POST",
    });
  },

  unfavoriteWord(word: string): Promise<void> {
    return request<void>(`/entries/en/${encodeURIComponent(word)}/unfavorite`, {
      method: "DELETE",
    });
  },
};
