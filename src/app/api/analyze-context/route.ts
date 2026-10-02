import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import type { Script } from "@/types";

// Mapa de contextos con palabras clave para matching local (sin IA).
const CONTEXT_KEYWORDS: Record<string, string[]> = {
  "Error":                ["error", "equivoqué", "pifié", "fallé", "salió mal", "arruiné", "metí la pata", "no debería haber"],
  "Comparación":          ["comparación", "comparo", "avanzan", "me quedo atrás", "suficiente", "envidia", "mejor que yo", "logros", "exitoso", "exitosa"],
  "Procrastinación":      ["procrastino", "procrastinación", "no arranco", "después", "no puedo empezar", "evito", "postergo", "no arrancé"],
  "Ansiedad física":      ["ansiedad", "tiemblo", "latidos", "me ahogo", "tensión", "paralizo", "pánico", "angustia", "nervios", "respirar"],
  "Descanso y culpa":     ["descanso", "culpa", "vaga", "no hago nada", "produciendo", "perdiendo el tiempo", "debería hacer", "holgazana"],
  "Límites difíciles":    ["límites", "no sé decir no", "cedí", "culpable por negarme", "no puedo negarme", "siempre digo sí"],
  "Redes y opiniones":    ["redes", "opinión", "qué dirán", "juzgan", "exposición", "instagram", "redes sociales", "seguidores", "likes"],
  "Pareja y vínculos":    ["pareja", "relación", "vínculo", "mi pareja", "me abandona", "amor", "novio", "novia", "marido", "esposo"],
  "Cuidadora":            ["maternidad", "hijos", "hija", "hijo", "cuidado", "no soy buena madre", "mamá", "crianza", "agotada de cuidar", "cuidadora"],
  "Dinero":               ["dinero", "plata", "deudas", "no gano", "finanzas", "económico", "gasté", "no llego", "sueldo", "deuda"],
  "Rendimiento y estudio":["rendimiento", "estudio", "notas", "no aprendo", "no rindo", "académico", "examen", "materias", "me va mal"],
  "Trabajo y proyectos":  ["trabajo", "proyecto", "laboral", "jefa", "equipo", "profesional", "trabajo mal", "no rindo en el trabajo", "jefe", "empleada"],
};

// Mensajes de apertura por contexto (sin IA).
const INITIAL_MESSAGES: Record<string, string> = {
  "Error":                "Reconocer que cometiste un error ya es un acto de valentía.",
  "Comparación":          "Compararse con otros es agotador — hoy te acompañamos a volver a vos.",
  "Procrastinación":      "El hecho de que estés acá muestra que querés moverte.",
  "Ansiedad física":      "Tu cuerpo está avisando algo — vamos a escucharlo juntos.",
  "Descanso y culpa":     "Descansar es parte del camino, no una traición a él.",
  "Límites difíciles":    "Decir que no también es cuidarte.",
  "Redes y opiniones":    "La mirada ajena pesa — hoy enfocamos la tuya.",
  "Pareja y vínculos":    "Los vínculos nos movilizan profundo — aquí hay espacio para eso.",
  "Cuidadora":            "Cuidar a otros desde el agotamiento es muy difícil.",
  "Dinero":               "El dinero activa muchas voces críticas — hoy las miramos con compasión.",
  "Rendimiento y estudio":"No rendir al máximo no te define.",
  "Trabajo y proyectos":  "El trabajo dice mucho de lo que exigimos — hoy bajamos un poco esa vara.",
};

type ContextRow = { id: number };
type ScriptRow  = Pick<Script, "id" | "voz_critica" | "respuesta_compasiva" | "valor_asociado" | "anclaje">;

function matchContext(feeling: string): string {
  const text = feeling.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [ctx, keywords] of Object.entries(CONTEXT_KEYWORDS)) {
    scores[ctx] = keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  // Si no hay ninguna coincidencia, elegimos uno al azar basado en hash.
  if (best[1] === 0) {
    const keys = Object.keys(CONTEXT_KEYWORDS);
    const hash = [...feeling].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return keys[hash % keys.length];
  }
  return best[0];
}

export async function POST(req: NextRequest) {
  const { feeling } = (await req.json()) as { feeling?: string };

  if (!feeling?.trim()) {
    return NextResponse.json({ error: "El campo 'feeling' es requerido." }, { status: 400 });
  }

  const contextName  = matchContext(feeling.trim());
  const initialMessage = INITIAL_MESSAGES[contextName] ?? "Gracias por compartir cómo te sentís.";

  // Buscamos el contexto en Supabase.
  const ctxResult = await supabase.from("contexts").select("id").eq("name", contextName).single();
  const context = (ctxResult as unknown as { data: ContextRow | null }).data;

  if (!context) {
    return NextResponse.json({ error: `Contexto no encontrado: ${contextName}` }, { status: 404 });
  }

  // Todos los guiones del contexto.
  const scriptsResult = await supabase
    .from("scripts")
    .select("id, voz_critica, respuesta_compasiva, valor_asociado, anclaje")
    .eq("context_id", context.id)
    .order("id");
  const scripts = (scriptsResult as unknown as { data: ScriptRow[] | null }).data;

  if (!scripts?.length) {
    return NextResponse.json({ error: "No hay guiones para este contexto." }, { status: 404 });
  }

  // Selección determinista: hash del input → índice dentro del contexto.
  const hash   = [...feeling].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const script = scripts[hash % scripts.length];

  return NextResponse.json({ script_id: script.id, script, initial_message: initialMessage });
}
