"use client";

import { useState, useEffect, use } from "react";
import { supabase, getSecureSession } from "@/lib/supabaseClient";
import PrintableAnchor from "@/components/ui/printable-anchor";
import type { Script } from "@/types";

type Step = 1 | 2 | 3 | 4 | 5; // 5 = done

// Autocompasión en acción — frase completable del libro
interface AccionFrase {
  sentir: string;
  valor: string;
  accion: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ feeling?: string }>;
}

export default function ScriptPage({ params, searchParams }: PageProps) {
  const { id }      = use(params);
  const { feeling } = use(searchParams);

  const [script,      setScript]      = useState<Script | null>(null);
  const [step,        setStep]        = useState<Step>(1);
  const [reflections, setReflections] = useState<Record<number, string>>({});
  const [aiResponse,  setAiResponse]  = useState("");
  const [loadingAI,   setLoadingAI]   = useState(false);
  const [userId,      setUserId]      = useState<string | null>(null);
  const [accion,      setAccion]      = useState<AccionFrase>({ sentir: "", valor: "", accion: "" });

  useEffect(() => {
    getSecureSession().then((s) => setUserId(s?.user?.id ?? null));
  }, []);

  // Cargar el guion desde Supabase
  useEffect(() => {
    if (!id) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("scripts")
      .select("*")
      .eq("id", Number(id))
      .single()
      .then(({ data }: { data: Script | null }) => setScript(data));
  }, [id]);

  function setReflection(step: number, text: string) {
    setReflections((prev) => ({ ...prev, [step]: text }));
  }

  async function finish() {
    if (!script) return;
    setLoadingAI(true);

    const res = await fetch("/api/process-journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        script_id:          script.id,
        voz_critica:        feeling ?? script.voz_critica,
        respuesta_compasiva:script.respuesta_compasiva,
        valor_asociado:     script.valor_asociado,
        anclaje:            script.anclaje,
        user_reflection:    Object.values(reflections).join("\n\n"),
        ...(userId ? { user_id: userId } : {}),
      }),
    });

    const data = (await res.json()) as { ai_empathetic_response?: string };
    setAiResponse(data.ai_empathetic_response ?? "");
    setLoadingAI(false);
    setStep(5);
  }

  if (!script) {
    return (
      <div className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-8 h-8 rounded-full border-2 border-[#107671]/30 border-t-[#107671] animate-spin" />
      </div>
    );
  }

  // Step labels & content mapping
  const STEPS = [
    { label: "Tu voz crítica",        content: script.voz_critica,         prompt: "¿Cómo te hace sentir esta voz?" },
    { label: "Respuesta compasiva",   content: script.respuesta_compasiva,  prompt: "¿Qué parte de esta respuesta te resuena más?" },
    { label: "Tu valor conectado",    content: script.valor_asociado,       prompt: "¿Cómo podés honrar este valor hoy?" },
    { label: "Tu anclaje",            content: script.anclaje,              prompt: "¿Cuándo vas a usar esta frase esta semana?" },
  ] as const;

  if (step === 5) {
    return (
      <main className="min-h-[calc(100dvh-3.5rem)] bg-[#FDFBF7] px-5 py-10">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center mb-6">
            <span className="text-3xl">🌿</span>
            <h2 className="text-xl font-semibold text-[#107671] mt-2">Reflexión completada</h2>
          </div>

          {aiResponse && (
            <div className="rounded-2xl bg-[#107671]/8 px-6 py-5">
              <p className="text-[#107671] leading-relaxed text-sm">{aiResponse}</p>
            </div>
          )}

          {/* ── Autocompasión en acción (del libro) ────────────────── */}
          <div className="rounded-2xl border border-[#107671]/15 bg-white/70 px-5 py-5 print:hidden">
            <p className="text-xs font-semibold text-[#107671]/50 uppercase tracking-widest mb-4">
              Autocompasión en acción
            </p>
            <div className="space-y-3 mb-5">
              {[
                { verb: "ESCUCHO",     q: "¿Qué me dice mi voz crítica?" },
                { verb: "RESPONDO",    q: "¿Puedo responderme con calidez, sabiduría y coraje?" },
                { verb: "RECUERDO",    q: "¿Quién quiero ser en este momento?" },
                { verb: "DOY UN PASO", q: "¿Cuál es el gesto más pequeño que puedo hacer hoy?" },
              ].map(({ verb, q }) => (
                <div key={verb} className="flex items-start gap-3">
                  <span className="text-[10px] font-bold text-[#107671] bg-[#107671]/10 rounded-full px-2 py-1 flex-shrink-0 mt-0.5 tracking-wider">
                    {verb}
                  </span>
                  <p className="text-xs text-[#107671]/65 pt-1">{q}</p>
                </div>
              ))}
            </div>

            {/* Frase completable */}
            <div className="rounded-xl bg-[#107671]/5 px-4 py-3">
              <p className="text-xs text-[#107671]/50 mb-3 italic">Completá tu frase:</p>
              <p className="text-sm text-[#107671] leading-relaxed">
                <span className="opacity-60">Aunque hoy me siento </span>
                <input
                  type="text"
                  placeholder="(emoción o estado)"
                  value={accion.sentir}
                  onChange={(e) => setAccion((a) => ({ ...a, sentir: e.target.value }))}
                  className="inline-block border-b border-[#107671]/40 bg-transparent text-[#107671] placeholder:text-[#107671]/25 outline-none text-sm w-32 mx-1"
                />
                <span className="opacity-60">, puedo acercarme al valor de </span>
                <input
                  type="text"
                  placeholder={script.valor_asociado.split("/")[0].trim()}
                  value={accion.valor}
                  onChange={(e) => setAccion((a) => ({ ...a, valor: e.target.value }))}
                  className="inline-block border-b border-[#107671]/40 bg-transparent text-[#107671] placeholder:text-[#107671]/25 outline-none text-sm w-28 mx-1"
                />
                <span className="opacity-60"> haciendo </span>
                <input
                  type="text"
                  placeholder="una pequeña acción"
                  value={accion.accion}
                  onChange={(e) => setAccion((a) => ({ ...a, accion: e.target.value }))}
                  className="inline-block border-b border-[#107671]/40 bg-transparent text-[#107671] placeholder:text-[#107671]/25 outline-none text-sm w-36 mx-1"
                />
                <span className="opacity-60">.</span>
              </p>
            </div>
          </div>

          <PrintableAnchor anclaje={script.anclaje} valor={script.valor_asociado} />

          <button
            onClick={() => window.print()}
            className="w-full rounded-2xl border border-[#107671]/25 py-3 text-sm text-[#107671] hover:bg-[#107671]/5 transition-colors print:hidden"
          >
            Imprimir tarjeta de anclaje
          </button>
          <div className="grid grid-cols-2 gap-3 print:hidden">
            <a
              href="/valores"
              className="rounded-2xl border border-[#107671]/25 py-3 text-sm text-center text-[#107671] hover:bg-[#107671]/5 transition-colors"
            >
              🌳 Mis valores
            </a>
            <a
              href="/dashboard"
              className="rounded-2xl border border-[#107671]/25 py-3 text-sm text-center text-[#107671] hover:bg-[#107671]/5 transition-colors"
            >
              📖 Mi historial
            </a>
          </div>
          <a
            href="/"
            className="block text-center text-sm text-[#107671]/50 hover:text-[#107671] transition-colors print:hidden"
          >
            ← Volver al inicio
          </a>
        </div>
      </main>
    );
  }

  const currentStep = STEPS[step - 1];

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] bg-[#FDFBF7] px-5 py-10">
      <div className="max-w-lg mx-auto">

        {/* Barra de progreso */}
        <div className="flex gap-1.5 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < step ? "bg-[#107671]" : "bg-[#107671]/15"
            }`} />
          ))}
        </div>

        {/* Número de paso */}
        <p className="text-xs text-[#107671]/50 mb-1">Paso {step} de 4</p>
        <h2 className="text-lg font-semibold text-[#107671] mb-5">{currentStep.label}</h2>

        {/* Contenido del guion */}
        <div className="rounded-2xl bg-[#107671]/6 border border-[#107671]/12 px-5 py-5 mb-6">
          {step === 1 && feeling && (
            <p className="text-xs text-[#107671]/50 italic mb-3">
              Lo que escribiste: &ldquo;{feeling}&rdquo;
            </p>
          )}
          <p className="text-[#107671] leading-relaxed font-medium">{currentStep.content}</p>
        </div>

        {/* Input de reflexión */}
        <p className="text-sm text-[#107671]/70 mb-2">{currentStep.prompt}</p>
        <textarea
          rows={3}
          value={reflections[step] ?? ""}
          onChange={(e) => setReflection(step, e.target.value)}
          placeholder="Escribí lo que surge…"
          className="w-full rounded-2xl border border-[#107671]/20 bg-white/70 px-4 py-3 text-[#107671] placeholder:text-[#107671]/30 outline-none focus:border-[#107671]/50 resize-none text-sm transition-colors"
        />

        {/* Botones de navegación */}
        <div className="flex gap-3 mt-5">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="flex-1 rounded-2xl border border-[#107671]/25 py-3 text-sm text-[#107671] hover:bg-[#107671]/5 transition-colors"
            >
              ← Atrás
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as Step)}
              className="flex-1 rounded-2xl bg-[#107671] py-3 text-sm font-medium text-[#FDFBF7] transition-opacity"
            >
              Siguiente →
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={loadingAI}
              className="flex-1 rounded-2xl bg-[#107671] py-3 text-sm font-medium text-[#FDFBF7] disabled:opacity-40 transition-opacity"
            >
              {loadingAI ? "Generando cierre…" : "Completar reflexión →"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
