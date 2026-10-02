"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, getSecureSession } from "@/lib/supabaseClient";

// ── Valores del libro, organizados en 3 dimensiones ──────────────────────────

type Category = "presencia" | "conexion" | "accion";

interface Valor {
  nombre: string;
  descripcion: string;
  categoria: Category;
}

const VALORES: Valor[] = [
  // Raíces — Presencia y Autocuidado
  { nombre: "Autenticidad",   descripcion: "Actuar de acuerdo a quien soy de manera sincera.",            categoria: "presencia" },
  { nombre: "Autocuidado",    descripcion: "Cuidar de mí, de los demás y del entorno.",                   categoria: "presencia" },
  { nombre: "Autoaceptación", descripcion: "Estar aceptándome a mí, a los demás y a la vida.",            categoria: "presencia" },
  { nombre: "Atención plena", descripcion: "Estar abierta, comprometida y curiosa con el presente.",      categoria: "presencia" },
  { nombre: "Apertura",       descripcion: "Abrirme a nuevas experiencias, ideas y opciones.",            categoria: "presencia" },
  { nombre: "Flexibilidad",   descripcion: "Ajustarme con suavidad a lo que va cambiando.",               categoria: "presencia" },
  { nombre: "Salud",          descripcion: "Cuidar mi cuerpo y mi bienestar psíquico.",                   categoria: "presencia" },
  { nombre: "Paz interior",   descripcion: "Cultivar serenidad y equilibrio interno.",                    categoria: "presencia" },
  // Ramas — Conexión con Otros
  { nombre: "Amor",           descripcion: "Actuar con amor o afecto hacia mí y los demás.",              categoria: "conexion" },
  { nombre: "Amabilidad",     descripcion: "Ser amable, considerada, cariñosa conmigo y otros.",          categoria: "conexion" },
  { nombre: "Compasión",      descripcion: "Acompañar el sufrimiento con amabilidad y acción.",           categoria: "conexion" },
  { nombre: "Intimidad",      descripcion: "Compartir mis experiencias profundas con otros.",             categoria: "conexion" },
  { nombre: "Honestidad",     descripcion: "Ser honesta, veraz y sincera conmigo y los demás.",           categoria: "conexion" },
  { nombre: "Conexión",       descripcion: "Crear relaciones cercanas y de apoyo.",                       categoria: "conexion" },
  { nombre: "Generosidad",    descripcion: "Dar y compartir lo que tengo con otros.",                     categoria: "conexion" },
  { nombre: "Respeto",        descripcion: "Tratarme y tratar a otros con cuidado y consideración.",      categoria: "conexion" },
  // Frutos — Acción y Propósito
  { nombre: "Coraje",         descripcion: "Actuar con valentía incluso ante el miedo o la dificultad.", categoria: "accion" },
  { nombre: "Creatividad",    descripcion: "Generar ideas, productos o conceptos nuevos.",                categoria: "accion" },
  { nombre: "Curiosidad",     descripcion: "Explorar y descubrir con mente abierta.",                    categoria: "accion" },
  { nombre: "Crecimiento",    descripcion: "Seguir cambiando y evolucionando.",                          categoria: "accion" },
  { nombre: "Compromiso",     descripcion: "Participar plenamente en lo que estoy haciendo.",            categoria: "accion" },
  { nombre: "Responsabilidad",descripcion: "Tomar decisiones y rendir cuentas por mis actos.",           categoria: "accion" },
  { nombre: "Autonomía",      descripcion: "Elegir cómo vivo y respetar la elección de otros.",          categoria: "accion" },
  { nombre: "Perseverancia",  descripcion: "Continuar con decisión, a pesar de las dificultades.",       categoria: "accion" },
];

const CAT_META: Record<Category, { label: string; sub: string; emoji: string; color: string }> = {
  presencia: { label: "Raíces · Presencia y Autocuidado", sub: "Cómo querés estar con vos misma",       emoji: "🌱", color: "#5B8A6F" },
  conexion:  { label: "Ramas · Conexión con Otros",       sub: "Cómo querés vincularte",                emoji: "🌿", color: "#107671" },
  accion:    { label: "Frutos · Acción y Propósito",      sub: "Cómo querés actuar en el mundo",        emoji: "🌻", color: "#2D6A4F" },
};

// ── Tipos ────────────────────────────────────────────────────────────────────

type Rating  = "MI" | "BI" | "NI" | null;
type Ratings = Record<string, Rating>;
// Steps: 0=árbol intro, 1=calificar, 2=elegir 10, 3=elegir 3, 4=reflexión, 5=done
type Step = 0 | 1 | 2 | 3 | 4 | 5;

const REFLEXION_PREGUNTAS = [
  "¿Qué es lo más importante para vos?",
  "¿Cómo querés tratarte a vos misma y a los demás?",
  "¿Qué tipo de vida querés construir?",
  "¿Qué huellas te gustaría dejar cuando ya no estés en este planeta?",
  "¿Cuán presentes están hoy tus valores en tu vida cotidiana?",
  "¿De qué manera podrías vivir un poco más alineada con ellos?",
];

// ── Imagen del árbol (original del libro) ────────────────────────────────────

function ArbolSVG() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/arbol-valores.png"
      alt="El Yo que elijo ser — árbol de valores"
      className="w-full max-w-sm mx-auto drop-shadow-sm rounded-xl"
    />
  );
}

// ── Pantalla introductoria del árbol ─────────────────────────────────────────

function PantallaArbol({ onContinuar }: { onContinuar: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-[#107671] mb-1">El Yo que elijo ser</h1>
        <p className="text-sm text-[#107671]/55">Tus valores como un árbol de vida</p>
      </div>

      <ArbolSVG />

      {/* Leyenda de zonas */}
      <div className="grid grid-cols-1 gap-2.5">
        <div className="rounded-2xl border border-[#E64A19]/20 bg-[#FFF3E0]/60 px-4 py-3 flex items-start gap-3">
          <span className="text-lg mt-0.5">🌸</span>
          <div>
            <p className="text-xs font-semibold text-[#BF360C]">3. Acción Comprometida — El Fruto del Propósito</p>
            <p className="text-[11px] text-[#BF360C]/70 mt-0.5">Disposiciones que impulsan el movimiento hacia metas valiosas, con valentía.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-[#2E7D32]/20 bg-[#E8F5E9]/60 px-4 py-3 flex items-start gap-3">
          <span className="text-lg mt-0.5">🍃</span>
          <div>
            <p className="text-xs font-semibold text-[#1B5E20]">2. Conexión con Otros — Cultivando Vínculos Vitales</p>
            <p className="text-[11px] text-[#1B5E20]/70 mt-0.5">Valores que guían tus interacciones y la forma en que nutrís tus relaciones.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-[#795548]/20 bg-[#EFEBE9]/60 px-4 py-3 flex items-start gap-3">
          <span className="text-lg mt-0.5">🌱</span>
          <div>
            <p className="text-xs font-semibold text-[#4E342E]">1. Apertura y Conciencia — La Raíz de la Presencia</p>
            <p className="text-[11px] text-[#4E342E]/70 mt-0.5">El estado de receptividad para observar tu experiencia interna sin juzgar.</p>
          </div>
        </div>
      </div>

      {/* Pregunta clave del libro */}
      <div className="rounded-2xl border border-[#107671]/20 bg-[#107671]/5 px-5 py-4 text-center">
        <p className="text-xs text-[#107671]/60 mb-1">¿Cómo usar esta lista?</p>
        <p className="text-sm text-[#107671] leading-relaxed font-medium">
          Elegí 3 de estas palabras y preguntate:<br/>
          <em className="font-normal">&ldquo;Si yo fuera un [valor], ¿qué pequeña acción haría hoy que demostraría esa cualidad?&rdquo;</em>
        </p>
      </div>

      <button
        onClick={onContinuar}
        className="w-full rounded-2xl bg-[#107671] py-4 font-medium text-[#FDFBF7]"
      >
        Explorar mis valores →
      </button>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function ValoresPage() {
  const router  = useRouter();
  const [step,        setStep]        = useState<Step>(0);
  const [ratings,     setRatings]     = useState<Ratings>({});
  const [top10,       setTop10]       = useState<string[]>([]);
  const [top3,        setTop3]        = useState<string[]>([]);
  const [reflexiones, setReflexiones] = useState<Record<number, string>>({});
  const [saving,      setSaving]      = useState(false);
  const [userId,      setUserId]      = useState<string | null>(null);

  useEffect(() => {
    getSecureSession().then((s) => setUserId(s?.user?.id ?? null));
  }, []);

  // ── Paso 1 ────────────────────────────────────────────────────────────────
  function rate(nombre: string, r: Rating) {
    setRatings((prev) => ({ ...prev, [nombre]: r }));
  }

  function goToStep2() {
    const mi   = VALORES.filter((v) => ratings[v.nombre] === "MI").map((v) => v.nombre);
    const bi   = VALORES.filter((v) => ratings[v.nombre] === "BI").map((v) => v.nombre);
    const pool = [...mi, ...bi];
    setTop10(pool.slice(0, Math.max(pool.length, 3)));
    setStep(2);
  }

  // ── Paso 2 ────────────────────────────────────────────────────────────────
  function toggleTop10(nombre: string) {
    setTop10((prev) =>
      prev.includes(nombre) ? prev.filter((v) => v !== nombre) : [...prev, nombre]
    );
  }

  // ── Paso 3 ────────────────────────────────────────────────────────────────
  function toggleTop3(nombre: string) {
    if (top3.includes(nombre)) {
      setTop3((prev) => prev.filter((v) => v !== nombre));
    } else if (top3.length < 3) {
      setTop3((prev) => [...prev, nombre]);
    }
  }

  // ── Reflexión ─────────────────────────────────────────────────────────────
  function setRef(i: number, text: string) {
    setReflexiones((prev) => ({ ...prev, [i]: text }));
  }

  // ── Guardar ───────────────────────────────────────────────────────────────
  async function save() {
    if (top3.length !== 3) return;
    setSaving(true);
    if (userId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("profiles")
        .update({ anchor_values: top3 })
        .eq("id", userId);
    }
    localStorage.setItem("hb_anchor_values", JSON.stringify(top3));
    setStep(5);
    setSaving(false);
  }

  // ── Indicador de progreso (pasos 1-4) ─────────────────────────────────────
  const STEP_LABELS = ["Calificá", "Filtrá a 10", "Elegí 3", "Reflexión"];

  const allRated = VALORES.every((v) => ratings[v.nombre]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-[calc(100dvh-3.5rem)] bg-[#FDFBF7] px-5 py-10">
      <div className="max-w-lg mx-auto">

        {/* ── Pantalla 0: árbol intro ─────────────────────────────────── */}
        {step === 0 && <PantallaArbol onContinuar={() => setStep(1)} />}

        {/* ── Pasos 1-4: indicador ───────────────────────────────────── */}
        {step >= 1 && step <= 4 && (
          <div className="flex items-center gap-2 mb-8">
            {STEP_LABELS.map((label, i) => {
              const s = (i + 1) as 1 | 2 | 3 | 4;
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    step >= s ? "bg-[#107671] text-[#FDFBF7]" : "bg-[#107671]/15 text-[#107671]/40"
                  }`}>{s}</div>
                  {i < 3 && <div className={`h-px w-6 ${step > s ? "bg-[#107671]" : "bg-[#107671]/20"}`} />}
                </div>
              );
            })}
            <span className="ml-1 text-xs text-[#107671]/50">{STEP_LABELS[step - 1]}</span>
          </div>
        )}

        {/* ── PASO 1: Calificar ──────────────────────────────────────── */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold text-[#107671] mb-1">¿Qué te importa de verdad?</h2>
            <p className="text-sm text-[#107671]/60 mb-6">
              Marcá cada valor: MI = Muy importante · BI = Bastante importante · NI = No tan importante
            </p>

            {(["presencia", "conexion", "accion"] as Category[]).map((cat) => {
              const m = CAT_META[cat];
              const catValores = VALORES.filter((v) => v.categoria === cat);
              return (
                <div key={cat} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span>{m.emoji}</span>
                    <div>
                      <p className="text-xs font-semibold text-[#107671]/80">{m.label}</p>
                      <p className="text-[10px] text-[#107671]/50">{m.sub}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {catValores.map((v) => (
                      <div key={v.nombre} className="rounded-2xl border border-[#107671]/15 bg-white/60 px-4 py-3">
                        <p className="text-sm font-medium text-[#107671]">{v.nombre}</p>
                        <p className="text-xs text-[#107671]/50 mb-2">{v.descripcion}</p>
                        <div className="flex gap-2">
                          {(["MI", "BI", "NI"] as const).map((r) => (
                            <button
                              key={r}
                              onClick={() => rate(v.nombre, r)}
                              className={`flex-1 rounded-xl py-1.5 text-xs font-medium transition-colors ${
                                ratings[v.nombre] === r
                                  ? "bg-[#107671] text-[#FDFBF7]"
                                  : "bg-[#107671]/8 text-[#107671]/60 hover:bg-[#107671]/15"
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="text-center text-xs text-[#107671]/40 mb-2">
              {Object.keys(ratings).length}/{VALORES.length} calificados
            </div>
            <button
              onClick={goToStep2}
              disabled={!allRated}
              className="w-full rounded-2xl bg-[#107671] py-4 font-medium text-[#FDFBF7] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continuar →
            </button>
          </>
        )}

        {/* ── PASO 2: Elegir 10 ─────────────────────────────────────── */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold text-[#107671] mb-1">Reducí a tus 10 esenciales</h2>
            <p className="text-sm text-[#107671]/60 mb-6">
              De los valores que marcaste como importantes, deseleccioná hasta quedarte con 10.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {[...VALORES.filter((v) => ratings[v.nombre] === "MI"), ...VALORES.filter((v) => ratings[v.nombre] === "BI")].map((v) => (
                <button
                  key={v.nombre}
                  onClick={() => toggleTop10(v.nombre)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    top10.includes(v.nombre)
                      ? "bg-[#107671] text-[#FDFBF7]"
                      : "bg-[#107671]/10 text-[#107671]/40 line-through"
                  }`}
                >
                  {v.nombre}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#107671]/50 mb-4 text-center">{top10.length} seleccionados</p>
            <button
              onClick={() => setStep(3)}
              disabled={top10.length < 3}
              className="w-full rounded-2xl bg-[#107671] py-4 font-medium text-[#FDFBF7] disabled:opacity-30"
            >
              Elegir mis 3 valores ancla →
            </button>
          </>
        )}

        {/* ── PASO 3: Elegir 3 ──────────────────────────────────────── */}
        {step === 3 && (
          <>
            <h2 className="text-xl font-semibold text-[#107671] mb-1">Tus 3 valores esenciales</h2>
            <p className="text-sm text-[#107671]/60 mb-2">
              Si solo pudieras elegir tres valores para guiar tu vida, ¿cuáles serían?
            </p>
            <p className="text-xs text-[#107671]/40 italic mb-6">
              Antes de elegir, tomá un respiro consciente.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              {top10.map((nombre) => (
                <button
                  key={nombre}
                  onClick={() => toggleTop3(nombre)}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                    top3.includes(nombre)
                      ? "bg-[#107671] text-[#FDFBF7] scale-105 shadow-sm"
                      : top3.length >= 3
                      ? "bg-[#107671]/8 text-[#107671]/30 cursor-not-allowed"
                      : "bg-[#107671]/10 text-[#107671]/70 hover:bg-[#107671]/20"
                  }`}
                >
                  {top3.includes(nombre) ? `✓ ${nombre}` : nombre}
                </button>
              ))}
            </div>

            {top3.length === 3 && (
              <div className="rounded-2xl bg-[#107671]/8 px-5 py-4 mb-4 text-center">
                <p className="text-[#107671] font-medium text-sm mb-1">Tus valores ancla:</p>
                <p className="text-[#107671] font-semibold">{top3.join(" · ")}</p>
                <div className="mt-2 text-xs text-[#107671]/50 space-y-0.5">
                  <p>¿Tienen algo en común entre sí?</p>
                  <p>¿Una vida al servicio de estos valores sería una vida bien vivida?</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setStep(4)}
              disabled={top3.length !== 3}
              className="w-full rounded-2xl bg-[#107671] py-4 font-medium text-[#FDFBF7] disabled:opacity-30"
            >
              Continuar a la reflexión →
            </button>
          </>
        )}

        {/* ── PASO 4: Reflexión escrita ─────────────────────────────── */}
        {step === 4 && (
          <>
            <h2 className="text-xl font-semibold text-[#107671] mb-1">Reflexión escrita</h2>
            <p className="text-sm text-[#107671]/60 mb-6">
              Una mirada honesta. No busques respuestas perfectas, buscá respuestas sinceras.
            </p>
            <div className="space-y-4 mb-6">
              {REFLEXION_PREGUNTAS.map((pregunta, i) => (
                <div key={i} className="rounded-2xl border border-[#107671]/15 bg-white/60 px-4 py-4">
                  <p className="text-sm font-medium text-[#107671] mb-2">{pregunta}</p>
                  <textarea
                    rows={3}
                    value={reflexiones[i] ?? ""}
                    onChange={(e) => setRef(i, e.target.value)}
                    placeholder="Escribí lo que surge…"
                    className="w-full rounded-xl border border-[#107671]/15 bg-transparent px-3 py-2 text-sm text-[#107671] placeholder:text-[#107671]/30 outline-none focus:border-[#107671]/40 resize-none"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="w-full rounded-2xl bg-[#107671] py-4 font-medium text-[#FDFBF7] disabled:opacity-40"
            >
              {saving ? "Guardando…" : "Guardar mis valores →"}
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="w-full mt-2 text-sm text-[#107671]/40 hover:text-[#107671]/60 py-2"
            >
              Saltar reflexión y guardar
            </button>
          </>
        )}

        {/* ── PASO 5: Listo ─────────────────────────────────────────── */}
        {step === 5 && (
          <div className="text-center space-y-6 py-8">
            <span className="text-4xl">🌳</span>
            <div>
              <h2 className="text-xl font-semibold text-[#107671] mb-2">¡Tus valores están guardados!</h2>
              <p className="text-sm text-[#107671]/60">Estos tres valores van a acompañarte en cada reflexión</p>
            </div>

            <div className="rounded-2xl bg-[#107671]/8 px-6 py-5">
              <p className="text-xs text-[#107671]/50 uppercase tracking-widest mb-3">Tus valores ancla</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {top3.map((v) => (
                  <span key={v} className="rounded-full bg-[#107671] text-[#FDFBF7] px-4 py-1.5 text-sm font-medium">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#107671]/15 bg-white/60 px-5 py-4 text-sm text-[#107671]/70 leading-relaxed text-left">
              <p className="font-medium text-[#107671] mb-1">Para llevar con vos hoy</p>
              <p>A lo largo del día, cada vez que tengas que tomar una decisión, preguntate: <em>¿Esto me acerca o me aleja de lo que realmente es importante para mí?</em></p>
            </div>

            <a
              href="/"
              className="block w-full rounded-2xl bg-[#107671] py-4 font-medium text-[#FDFBF7] text-center"
            >
              Ir a los guiones →
            </a>
            <a
              href="/"
              className="block text-sm text-[#107671]/40 hover:text-[#107671]/60"
            >
              ← Volver al inicio
            </a>
          </div>
        )}

      </div>
    </main>
  );
}
