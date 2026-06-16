import axios from "axios";

const api = axios.create({
  // Aponta para a porta do nosso container de backend Express
  baseURL: "http://localhost:3333",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para injetar o Token JWT automaticamente caso ele exista no localStorage
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("@Florita:token")
      : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
