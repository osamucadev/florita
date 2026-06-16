"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { AppHeader } from "@/components/layout/AppHeader";
import { SessionGuard } from "@/components/SessionGuard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, hydrate } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    hydrate();
    setTimeout(() => setIsHydrated(true), 0);
  }, [hydrate]);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/");
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated || !user) {
    return null;
  }

  return (
    <SessionGuard>
      <div className="flex flex-col min-h-screen bg-[#F6F4FC]">
        <AppHeader user={user} />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-10">
          {children}
        </main>
      </div>
    </SessionGuard>
  );
}
