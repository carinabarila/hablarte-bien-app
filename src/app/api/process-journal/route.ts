import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// Pool de cierres empáticos estáticos (rotan por hash del anclaje).
const CIERRES = [
  "Completar este ejercicio es un acto de cuidado hacia vos misma. Llevá el anclaje contigo hoy.",
  "Lo que acabás de hacer importa. Reconocer tu voz crítica ya es cambiarle el poder.",
  "Cada vez que pasás por este proceso, te entrenás en hablarte mejor. Eso se acumula.",
  "La compasión no se aprende de una vez — se practica, como lo hiciste hoy.",
  "Escribir lo que sentís y responderte con cuidado es exactamente lo que este camino necesita.",
  "Hoy le diste espacio a tu experiencia y a tu valor. Eso es mucho.",
  "Este momento de reflexión ya hizo algo en vos. El anclaje te espera cuando lo necesites.",
];

interface JournalPayload {
  script_id: number;
  voz_critica: string;
  respuesta_compasiva: string;
  valor_asociado: string;
  anclaje: string;
  user_reflection: string;
  user_id?: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<JournalPayload>;
  const { script_id, voz_critica, anclaje, user_reflection } = body;

  if (!script_id || !user_reflection?.trim()) {
    return NextResponse.json(
      { error: "Se requieren 'script_id' y 'user_reflection'." },
      { status: 400 }
    );
  }

  // Elegimos un cierre basado en hash del anclaje + reflexión (determinista pero variado).
  const seed   = [...(anclaje ?? "") + (user_reflection ?? "")].reduce((a, c) => a + c.charCodeAt(0), 0);
  const aiResponse = CIERRES[seed % CIERRES.length];

  // Persistimos el log si el usuario está autenticado (best-effort).
  if (body.user_id) {
    const { error: dbErr } = await db.from("journal_logs").insert([{
      user_id: body.user_id,
      script_id,
      raw_user_feeling: voz_critica ?? "",
      user_reflection_text: user_reflection,
      ai_empathetic_response: aiResponse,
    }]);
    if (dbErr) console.error("process-journal: error guardando log", dbErr.message);
  }

  return NextResponse.json({ ai_empathetic_response: aiResponse });
}
