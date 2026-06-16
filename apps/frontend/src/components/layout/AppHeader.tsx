"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { getInitials } from "@/lib/utils";
import type { AuthUser } from "@/types/api";

interface AppHeaderProps {
  user: AuthUser;
}

const navLinks = [
  { href: "/home", label: "Início" },
  { href: "/dictionary", label: "Dicionário" },
  { href: "/favorites", label: "Favoritos" },
];

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <header className="w-full border-b border-[#E5DEF5] bg-[#F6F4FC] sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link
          href="/home"
          className="text-xs uppercase tracking-[0.2em] font-sans font-semibold text-[#5E00FA] shrink-0"
        >
          Florita
        </Link>

        {/* Navegação */}
        <nav
          className="hidden md:flex items-center gap-6"
          aria-label="Navegação principal"
        >
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative text-xs uppercase tracking-widest font-sans font-semibold transition-colors duration-200 ${
                  isActive
                    ? "text-[#1F0A3D]"
                    : "text-[#625678] hover:text-[#1F0A3D]"
                }`}
              >
                {label}
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-[#5E00FA]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Avatar + logout */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="w-7 h-7 rounded-full bg-[#5E00FA] flex items-center justify-center"
            aria-label={`Usuário: ${user.name}`}
          >
            <span className="text-[10px] font-sans font-bold text-white">
              {getInitials(user.name)}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="text-[11px] font-sans uppercase tracking-widest text-[#625678] hover:text-[#5E00FA] transition-colors duration-200"
            aria-label="Sair da plataforma"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Navegação mobile */}
      <nav
        className="md:hidden flex items-center border-t border-[#E5DEF5] overflow-x-auto"
        aria-label="Navegação mobile"
      >
        {navLinks.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 text-center py-2.5 text-[11px] uppercase tracking-widest font-sans font-semibold transition-colors duration-200 border-b-2 ${
                isActive
                  ? "text-[#5E00FA] border-[#5E00FA]"
                  : "text-[#625678] border-transparent hover:text-[#1F0A3D]"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
