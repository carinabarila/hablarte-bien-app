"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "loading" | "error";

export default function HomePage() {
  const router = useRouter();
  const [feeling, setFeeling] = useState("");
  const [status,  setStatus]  = useState<Status>("idle");
  const [error,   setError]   = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!feeling.trim()) return;
    setStatus("loading");
    setError("");

    try {
      const res  = await fetch("/api/analyze-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feeling: feeling.trim() }),
      });
      const data = (await res.json()) as { script_id?: number; error?: string };

      if (!res.ok || !data.script_id) {
        setError(data.error ?? "No pudimos encontrar un guion. Intentá de nuevo.");
        setStatus("error");
        return;
      }

      router.push(`/script/${data.script_id}?feeling=${encodeURIComponent(feeling.trim())}`);
    } catch {
      setError("Error de conexión. Revisá tu internet e intentá de nuevo.");
      setStatus("error");
    }
  }

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] flex flex-col items-center justify-center bg-[#FDFBF7] px-6 pb-safe">
      <div className="w-full max-w-lg">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold text-[#107671] mb-3 leading-snug">
            ¿Cómo te habla tu<br />voz crítica hoy?
          </h1>
          <p className="text-sm text-[#107671]/60">
            Escribí exactamente lo que escuchás adentro. Sin filtros.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={feeling}
            onChange={(e) => setFeeling(e.target.value)}
            placeholder="&ldquo;Otra vez la pifié. Nunca aprendo.&rdquo;"
            rows={4}
            required
            className="w-full rounded-2xl border border-[#107671]/25 bg-white/70 px-5 py-4 text-[#107671] placeholder:text-[#107671]/30 outline-none focus:border-[#107671]/60 resize-none transition-colors leading-relaxed"
          />

          {status === "error" && (
            <p className="text-sm text-red-500 px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading" || !feeling.trim()}
            className="w-full rounded-2xl bg-[#107671] py-4 font-medium text-[#FDFBF7] text-base transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "Procesando…" : "Encontrar mi guion →"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-[#107671]/40">
          Lo que escribís no se almacena hasta que elegís guardarlo.
        </p>
      </div>
    </main>
  );
}
