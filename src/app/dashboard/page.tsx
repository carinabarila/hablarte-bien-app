"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, getSecureSession } from "@/lib/supabaseClient";

// ── Tipos ────────────────────────────────────────────────────────────────────

interface JournalEntry {
  id: string;
  created_at: string;
  raw_user_feeling: string;
  user_reflection_text: string | null;
  ai_empathetic_response: string | null;
  script: {
    id: number;
    valor_asociado: string;
    anclaje: string;
    context: { name: string };
  } | null;
}

interface Profile {
  anchor_values: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function cleanQuotes(text: string) {
  return text.replace(/^[“”"']+|[“”"']+$/g, "").trim();
}

// ── Componente ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router  = useRouter();
  const [entries,  setEntries]  = useState<JournalEntry[]>([]);
  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  useEffect(() => {
    (async () => {
      const session = await getSecureSession();
      if (!session?.user) { router.replace("/login"); return; }

      const userId = session.user.id;

      // Cargar entradas del diario con join a scripts y contexts
      const { data: logs } = await db
        .from("journal_logs")
        .select(`
          id,
          created_at,
          raw_user_feeling,
          user_reflection_text,
          ai_empathetic_response,
          script:scripts (
            id,
            valor_asociado,
            anclaje,
            context:contexts ( name )
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      setEntries(logs ?? []);

      // Cargar valores ancla del perfil
      const { data: prof } = await db
        .from("profiles")
        .select("anchor_values")
        .eq("id", userId)
        .single();

      setProfile(prof ?? null);
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-8 h-8 rounded-full border-2 border-[#107671]/30 border-t-[#107671] animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] bg-[#FDFBF7] px-5 py-10">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-[#107671]">Mi historial</h1>
          <p className="text-sm text-[#107671]/55 mt-0.5">
            {entries.length === 0
              ? "Todavía no completaste ninguna reflexión."
              : `${entries.length} reflexión${entries.length !== 1 ? "es" : ""} completada${entries.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Valores ancla */}
        {profile && profile.anchor_values.length > 0 && (
          <div className="rounded-2xl border border-[#107671]/15 bg-white/70 px-5 py-4">
            <p className="text-xs text-[#107671]/50 uppercase tracking-widest mb-3">🌳 Mis valores ancla</p>
            <div className="flex flex-wrap gap-2">
              {profile.anchor_values.map((v) => (
                <span key={v} className="rounded-full bg-[#107671] text-[#FDFBF7] px-4 py-1.5 text-sm font-medium">
                  {v}
                </span>
              ))}
            </div>
            <button
              onClick={() => router.push("/valores")}
              className="mt-3 text-xs text-[#107671]/50 hover:text-[#107671] transition-colors"
            >
              Editar mis valores →
            </button>
          </div>
        )}

        {profile && profile.anchor_values.length === 0 && (
          <button
            onClick={() => router.push("/valores")}
            className="w-full rounded-2xl border border-dashed border-[#107671]/30 py-4 text-sm text-[#107671]/60 hover:border-[#107671]/50 hover:text-[#107671] transition-colors"
          >
            🌳 Explorar mis valores →
          </button>
        )}

        {/* Estadísticas rápidas */}
        {entries.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/70 border border-[#107671]/12 px-3 py-4 text-center">
              <p className="text-2xl font-semibold text-[#107671]">{entries.length}</p>
              <p className="text-[10px] text-[#107671]/50 mt-0.5">reflexiones</p>
            </div>
            <div className="rounded-2xl bg-white/70 border border-[#107671]/12 px-3 py-4 text-center">
              <p className="text-2xl font-semibold text-[#107671]">
                {new Set(entries.map((e) => e.script?.context?.name).filter(Boolean)).size}
              </p>
              <p className="text-[10px] text-[#107671]/50 mt-0.5">contextos</p>
            </div>
            <div className="rounded-2xl bg-white/70 border border-[#107671]/12 px-3 py-4 text-center">
              <p className="text-2xl font-semibold text-[#107671]">
                {new Set(entries.map((e) => new Date(e.created_at).toDateString())).size}
              </p>
              <p className="text-[10px] text-[#107671]/50 mt-0.5">días</p>
            </div>
          </div>
        )}

        {/* Lista de entradas */}
        {entries.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <span className="text-4xl">🌿</span>
            <p className="text-[#107671]/60 text-sm">
              Cuando completes tu primera reflexión, aparecerá aquí.
            </p>
            <a
              href="/"
              className="inline-block mt-2 rounded-2xl bg-[#107671] px-6 py-3 text-sm font-medium text-[#FDFBF7]"
            >
              Ir a los guiones →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const isOpen = expanded === entry.id;
              const contextName = entry.script?.context?.name ?? "Reflexión";
              const valor = entry.script?.valor_asociado ?? "";
              const anclaje = entry.script ? cleanQuotes(entry.script.anclaje) : "";

              return (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-[#107671]/12 bg-white/70 overflow-hidden"
                >
                  {/* Header de la tarjeta */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : entry.id)}
                    className="w-full px-5 py-4 text-left flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-medium text-[#107671]/50 uppercase tracking-wider">
                          {contextName}
                        </span>
                        <span className="text-[#107671]/20">·</span>
                        <span className="text-[10px] text-[#107671]/40">
                          {formatDate(entry.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-[#107671] font-medium truncate">
                        {valor}
                      </p>
                    </div>
                    <span className={`text-[#107671]/40 transition-transform flex-shrink-0 mt-0.5 ${isOpen ? "rotate-180" : ""}`}>
                      ▾
                    </span>
                  </button>

                  {/* Contenido expandido */}
                  {isOpen && (
                    <div className="px-5 pb-5 space-y-4 border-t border-[#107671]/8 pt-4">
                      {/* Anclaje */}
                      {anclaje && (
                        <div className="rounded-xl bg-[#107671]/6 px-4 py-3 text-center">
                          <p className="text-[10px] text-[#107671]/50 uppercase tracking-widest mb-1">Anclaje</p>
                          <p className="text-sm text-[#107671] font-semibold">
                            &ldquo;{anclaje}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* Reflexión del usuario */}
                      {entry.user_reflection_text && (
                        <div>
                          <p className="text-[10px] text-[#107671]/50 uppercase tracking-widest mb-1.5">Tu reflexión</p>
                          <p className="text-sm text-[#107671]/75 leading-relaxed whitespace-pre-line">
                            {entry.user_reflection_text}
                          </p>
                        </div>
                      )}

                      {/* Cierre de la IA */}
                      {entry.ai_empathetic_response && (
                        <div className="rounded-xl bg-[#107671]/8 px-4 py-3">
                          <p className="text-xs text-[#107671] leading-relaxed italic">
                            {entry.ai_empathetic_response}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Volver al inicio */}
        <a
          href="/"
          className="block text-center text-sm text-[#107671]/40 hover:text-[#107671] transition-colors pt-2"
        >
          ← Volver al inicio
        </a>

      </div>
    </main>
  );
}
