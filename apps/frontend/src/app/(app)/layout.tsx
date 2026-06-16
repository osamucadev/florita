"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { AppHeader } from "@/components/layout/AppHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Aguarda o hydrate terminar antes de redirecionar.
    // O hydrate é síncrono, então no primeiro render após montagem
    // o estado já estará correto.
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  // Enquanto não confirmou autenticação, não renderiza nada
  // para evitar flash do conteúdo protegido
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F4FC]">
      <AppHeader user={user} />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-10">
        {children}
      </main>
    </div>
  );
}
