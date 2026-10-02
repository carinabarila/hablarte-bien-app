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

// ── Componente árbol SVG (fiel al diseño del libro) ──────────────────────────

function ArbolSVG() {
  return (
    <svg viewBox="0 0 320 530" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-sm mx-auto drop-shadow-sm">
      <defs>
        <radialGradient id="canopyGrad" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#81C784" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="#A5D6A7" stopOpacity="0.10"/>
        </radialGradient>
        <radialGradient id="flowerGrad" cx="50%" cy="70%" r="50%">
          <stop offset="0%" stopColor="#FFCC80" stopOpacity="0.30"/>
          <stop offset="100%" stopColor="#FFE0B2" stopOpacity="0.05"/>
        </radialGradient>
      </defs>

      {/* ── Zona underground (raíces) ── */}
      <rect x="0" y="335" width="320" height="195" fill="#C4A882" opacity="0.12" rx="0"/>

      {/* ── Zona canopy wash ── */}
      <ellipse cx="160" cy="210" rx="145" ry="125" fill="url(#canopyGrad)"/>

      {/* ── Zona floral wash ── */}
      <ellipse cx="160" cy="85"  rx="115" ry="85"  fill="url(#flowerGrad)"/>

      {/* ── Tronco (orgánico, S-curva) ── */}
      <path d="M158 335 Q150 295 156 255 Q163 215 155 175 Q148 138 160 95"
            stroke="#795548" strokeWidth="22" fill="none" strokeLinecap="round" opacity="0.75"/>
      <path d="M158 335 Q150 295 156 255 Q163 215 155 175 Q148 138 160 95"
            stroke="#BCAAA4" strokeWidth="13" fill="none" strokeLinecap="round" opacity="0.35"/>

      {/* ── Ramas principales ── */}
      <path d="M155 248 Q118 218 82 198" stroke="#795548" strokeWidth="11" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M157 226 Q195 200 228 180" stroke="#795548" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M156 195 Q125 170 98 155" stroke="#795548" strokeWidth="8"  fill="none" strokeLinecap="round" opacity="0.65"/>
      <path d="M158 178 Q190 158 215 145" stroke="#795548" strokeWidth="7"  fill="none" strokeLinecap="round" opacity="0.65"/>
      <path d="M157 165 Q140 142 125 128" stroke="#795548" strokeWidth="6"  fill="none" strokeLinecap="round" opacity="0.55"/>
      <path d="M159 158 Q175 138 192 125" stroke="#795548" strokeWidth="6"  fill="none" strokeLinecap="round" opacity="0.55"/>

      {/* ── Raíces ── */}
      <path d="M155 338 Q122 360 90 378"  stroke="#795548" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M158 340 Q145 368 132 392" stroke="#795548" strokeWidth="7"  fill="none" strokeLinecap="round" opacity="0.65"/>
      <path d="M162 338 Q192 362 215 380" stroke="#795548" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M90 378 Q68 400 55 420"   stroke="#795548" strokeWidth="7"  fill="none" strokeLinecap="round" opacity="0.6"/>
      <path d="M215 380 Q232 402 242 422" stroke="#795548" strokeWidth="7"  fill="none" strokeLinecap="round" opacity="0.6"/>
      <path d="M132 392 Q118 415 108 436" stroke="#795548" strokeWidth="5"  fill="none" strokeLinecap="round" opacity="0.55"/>
      <path d="M55 420 Q40 440 35 458"   stroke="#795548" strokeWidth="5"  fill="none" strokeLinecap="round" opacity="0.5"/>
      <path d="M242 422 Q255 442 260 460" stroke="#795548" strokeWidth="5"  fill="none" strokeLinecap="round" opacity="0.5"/>

      {/* ── Copa de hojas ── */}
      <ellipse cx="88"  cy="195" rx="52" ry="38" fill="#4CAF50" opacity="0.28" transform="rotate(-18 88 195)"/>
      <ellipse cx="82"  cy="230" rx="55" ry="35" fill="#66BB6A" opacity="0.25" transform="rotate(-8 82 230)"/>
      <ellipse cx="100" cy="260" rx="50" ry="30" fill="#43A047" opacity="0.22" transform="rotate(-5 100 260)"/>
      <ellipse cx="228" cy="178" rx="52" ry="35" fill="#388E3C" opacity="0.28" transform="rotate(18 228 178)"/>
      <ellipse cx="222" cy="215" rx="52" ry="33" fill="#4CAF50" opacity="0.25" transform="rotate(10 222 215)"/>
      <ellipse cx="210" cy="250" rx="48" ry="30" fill="#66BB6A" opacity="0.22" transform="rotate(6 210 250)"/>
      <ellipse cx="157" cy="210" rx="60" ry="42" fill="#81C784" opacity="0.20"/>

      {/* ── Flores ── */}
      {/* Flor naranja grande */}
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
        <ellipse key={`p1-${i}`}
          cx={118 + 18 * Math.cos(deg * Math.PI / 180)}
          cy={75  + 18 * Math.sin(deg * Math.PI / 180)}
          rx="9" ry="6"
          fill="#FF8A65" opacity="0.82"
          transform={`rotate(${deg} ${118 + 18 * Math.cos(deg * Math.PI / 180)} ${75 + 18 * Math.sin(deg * Math.PI / 180)})`}
        />
      ))}
      <circle cx="118" cy="75" r="8" fill="#FFF9C4"/>

      {/* Flor lila */}
      {[0,51,102,153,204,255,306].map((deg, i) => (
        <ellipse key={`p2-${i}`}
          cx={192 + 15 * Math.cos(deg * Math.PI / 180)}
          cy={60  + 15 * Math.sin(deg * Math.PI / 180)}
          rx="8" ry="5"
          fill="#CE93D8" opacity="0.82"
          transform={`rotate(${deg} ${192 + 15 * Math.cos(deg * Math.PI / 180)} ${60 + 15 * Math.sin(deg * Math.PI / 180)})`}
        />
      ))}
      <circle cx="192" cy="60" r="7" fill="#FFF9C4"/>

      {/* Flor rosa pequeña */}
      {[0,60,120,180,240,300].map((deg, i) => (
        <ellipse key={`p3-${i}`}
          cx={155 + 11 * Math.cos(deg * Math.PI / 180)}
          cy={48  + 11 * Math.sin(deg * Math.PI / 180)}
          rx="6" ry="4"
          fill="#F48FB1" opacity="0.82"
          transform={`rotate(${deg} ${155 + 11 * Math.cos(deg * Math.PI / 180)} ${48 + 11 * Math.sin(deg * Math.PI / 180)})`}
        />
      ))}
      <circle cx="155" cy="48" r="5" fill="#FFF9C4"/>

      {/* Frutos naranja */}
      <circle cx="258" cy="95"  r="15" fill="#FF7043" opacity="0.82"/>
      <circle cx="247" cy="118" r="12" fill="#FFA726" opacity="0.80"/>
      <circle cx="270" cy="116" r="10" fill="#FF8C00" opacity="0.78"/>
      {/* Tallo frutos */}
      <path d="M258 80 Q260 70 263 65" stroke="#558B2F" strokeWidth="2" fill="none"/>
      <path d="M247 106 Q248 96 252 92" stroke="#558B2F" strokeWidth="2" fill="none"/>

      {/* ── Valores en RAÍCES ── */}
      <text transform="rotate(-28 102 367)" x="72"  y="372" fontSize="8.5" fill="#5D4037" fontStyle="italic" opacity="0.88">Receptivo</text>
      <text transform="rotate(-12 140 390)" x="108" y="394" fontSize="8"   fill="#5D4037" fontStyle="italic" opacity="0.85">Con perspectiva</text>
      <text transform="rotate(5 162 400)"  x="138" y="403" fontSize="8"   fill="#5D4037" fontStyle="italic" opacity="0.85">Autoconsciente</text>
      <text transform="rotate(28 200 368)" x="175" y="372" fontSize="8.5" fill="#5D4037" fontStyle="italic" opacity="0.88">Dispuesto</text>
      <text transform="rotate(-42 73 405)" x="42"  y="412" fontSize="8"   fill="#5D4037" fontStyle="italic" opacity="0.80">Vulnerable</text>
      <text transform="rotate(-50 55 425)" x="22"  y="432" fontSize="7.5" fill="#5D4037" fontStyle="italic" opacity="0.72">Abierto</text>
      <text transform="rotate(40 230 408)" x="208" y="413" fontSize="8"   fill="#5D4037" fontStyle="italic" opacity="0.80">Equilibrado</text>
      <text transform="rotate(48 248 428)" x="224" y="434" fontSize="7.5" fill="#5D4037" fontStyle="italic" opacity="0.72">Flexible</text>
      <text transform="rotate(-30 115 438)" x="86" y="444" fontSize="7.5" fill="#5D4037" fontStyle="italic" opacity="0.68">Presente</text>
      <text transform="rotate(32 228 445)" x="204" y="450" fontSize="7.5" fill="#5D4037" fontStyle="italic" opacity="0.68">Íntegro</text>
      <text transform="rotate(-55 42 458)" x="10"  y="465" fontSize="7"   fill="#5D4037" fontStyle="italic" opacity="0.62">Reflexivo</text>
      <text transform="rotate(50 260 460)" x="234" y="466" fontSize="7"   fill="#5D4037" fontStyle="italic" opacity="0.62">Auténtico</text>

      {/* ── Valores en RAMAS (conexión) ── */}
      <text x="16"  y="190" fontSize="8.5" fill="#2E7D32" fontStyle="italic" opacity="0.88">Altruista</text>
      <text x="10"  y="212" fontSize="8.5" fill="#2E7D32" fontStyle="italic" opacity="0.88">Atento</text>
      <text x="18"  y="233" fontSize="8.5" fill="#2E7D32" fontStyle="italic" opacity="0.85">Afectuoso</text>
      <text x="16"  y="253" fontSize="8.5" fill="#2E7D32" fontStyle="italic" opacity="0.85">Compasivo</text>
      <text x="30"  y="272" fontSize="8"   fill="#2E7D32" fontStyle="italic" opacity="0.82">Respetuoso</text>
      <text x="20"  y="290" fontSize="8"   fill="#2E7D32" fontStyle="italic" opacity="0.80">Colaborativo</text>
      <text x="12"  y="308" fontSize="8"   fill="#2E7D32" fontStyle="italic" opacity="0.78">Comunicativo</text>
      <text x="18"  y="324" fontSize="7.5" fill="#2E7D32" fontStyle="italic" opacity="0.72">Alentador</text>
      <text x="100" y="162" fontSize="8.5" fill="#1B5E20" fontStyle="italic" opacity="0.88">Amable</text>
      <text x="108" y="180" fontSize="8.5" fill="#1B5E20" fontStyle="italic" opacity="0.88">Honesto</text>
      <text x="210" y="172" fontSize="7.5" fill="#2E7D32" fontStyle="italic" opacity="0.85">Capaz de perdonar</text>
      <text x="224" y="192" fontSize="8.5" fill="#2E7D32" fontStyle="italic" opacity="0.85">Generoso</text>
      <text x="218" y="212" fontSize="8.5" fill="#2E7D32" fontStyle="italic" opacity="0.83">Leal</text>
      <text x="222" y="232" fontSize="8.5" fill="#2E7D32" fontStyle="italic" opacity="0.83">Confiado</text>
      <text x="228" y="252" fontSize="8"   fill="#2E7D32" fontStyle="italic" opacity="0.80">Tolerante</text>
      <text x="210" y="270" fontSize="8"   fill="#2E7D32" fontStyle="italic" opacity="0.80">Generativo</text>
      <text x="218" y="288" fontSize="8"   fill="#2E7D32" fontStyle="italic" opacity="0.78">Íntimo</text>
      <text x="220" y="306" fontSize="8"   fill="#2E7D32" fontStyle="italic" opacity="0.75">Recíproco</text>
      <text x="225" y="322" fontSize="7.5" fill="#2E7D32" fontStyle="italic" opacity="0.70">Social</text>

      {/* ── Valores en FRUTOS/FLORES (acción) ── */}
      <text x="52"  y="34"  fontSize="8"   fill="#BF360C" fontStyle="italic" opacity="0.88">Activo</text>
      <text x="85"  y="24"  fontSize="8"   fill="#BF360C" fontStyle="italic" opacity="0.88">Audaz</text>
      <text x="132" y="16"  fontSize="8"   fill="#BF360C" fontStyle="italic" opacity="0.88">Saludable</text>
      <text x="170" y="24"  fontSize="8"   fill="#BF360C" fontStyle="italic" opacity="0.85">Divertido</text>
      <text x="205" y="34"  fontSize="8"   fill="#BF360C" fontStyle="italic" opacity="0.85">Curioso</text>
      <text x="50"  y="55"  fontSize="8"   fill="#E64A19" fontStyle="italic" opacity="0.85">Ambicioso</text>
      <text x="48"  y="75"  fontSize="8"   fill="#E64A19" fontStyle="italic" opacity="0.85">Asertivo</text>
      <text x="44"  y="98"  fontSize="7.5" fill="#E64A19" fontStyle="italic" opacity="0.82">Autónomo</text>
      <text x="44"  y="118" fontSize="7.5" fill="#E64A19" fontStyle="italic" opacity="0.80">Creativo</text>
      <text x="42"  y="138" fontSize="7.5" fill="#E64A19" fontStyle="italic" opacity="0.78">Disciplinado</text>
      <text x="42"  y="158" fontSize="7.5" fill="#E64A19" fontStyle="italic" opacity="0.75">Enérgico</text>
      <text x="205" y="48"  fontSize="8"   fill="#BF360C" fontStyle="italic" opacity="0.85">Justo</text>
      <text x="205" y="68"  fontSize="7.5" fill="#E64A19" fontStyle="italic" opacity="0.82">Organizado</text>
      <text x="205" y="88"  fontSize="7.5" fill="#E64A19" fontStyle="italic" opacity="0.80">Apasionado</text>
      <text x="205" y="108" fontSize="7.5" fill="#E64A19" fontStyle="italic" opacity="0.80">Perseverante</text>
      <text x="205" y="128" fontSize="7.5" fill="#E64A19" fontStyle="italic" opacity="0.78">Productivo</text>
      <text x="205" y="148" fontSize="7.5" fill="#E64A19" fontStyle="italic" opacity="0.75">Responsable</text>
      <text x="205" y="166" fontSize="7.5" fill="#E64A19" fontStyle="italic" opacity="0.72">Espontáneo</text>

      {/* ── Línea de suelo ── */}
      <line x1="8" y1="334" x2="312" y2="334" stroke="#795548" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.35"/>

      {/* ── Semilla en el centro de las raíces ── */}
      <ellipse cx="160" cy="468" rx="9" ry="11" fill="#795548" opacity="0.40"/>
      <ellipse cx="160" cy="468" rx="5" ry="7"  fill="#BCAAA4" opacity="0.50"/>
    </svg>
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
