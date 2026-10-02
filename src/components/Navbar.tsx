"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase, onAuthStateChange } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => onAuthStateChange(setSession), []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Ocultar navbar en login
  if (pathname === "/login") return null;

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-sm border-b border-[#107671]/10 pt-safe">
      <div className="max-w-xl mx-auto flex items-center justify-between px-5 h-14">
        <Link href="/" className="text-[#107671] font-semibold text-base tracking-tight">
          Hablate Bien
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/valores"
            className="text-sm text-[#107671]/70 hover:text-[#107671] transition-colors"
          >
            🌳 Mis valores
          </Link>
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-[#107671]/70 hover:text-[#107671] transition-colors"
              >
                Historial
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-[#107671]/50 hover:text-[#107671] transition-colors"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm text-[#107671] font-medium"
            >
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
