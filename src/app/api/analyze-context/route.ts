import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import type { Script } from "@/types";

// Mapa de contextos con palabras clave para matching local (sin IA).
// Cuanto más específica la frase, mejor el matching.
const CONTEXT_KEYWORDS: Record<string, string[]> = {
  "Error": [
    "error", "equivoqué", "me equivoqué", "pifié", "fallé", "le fallé", "salió mal", "arruiné", "lo arruiné",
    "metí la pata", "no debería haber", "me arrepiento", "arrepentida", "tendría que haber", "no tendría",
    "fracasé", "hice mal", "hice las cosas mal", "salió todo mal", "la cagué", "no estuve",
    "dañé", "herí", "lastimé", "hice daño", "le hice daño", "me siento mal por lo que hice",
    "decepcioné a", "los decepcioné", "la decepcioné", "lo decepcioné", "avergüenzo",
    "vergüenza de lo que hice", "me da vergüenza lo que hice", "qué mala soy",
    "fallé a todos", "fallé en todo", "me salió mal"
  ],
  "Comparación": [
    "comparación", "me comparo", "comparo", "todos avanzan", "todos logran", "todo el mundo",
    "me quedo atrás", "quedé atrás", "soy menos", "soy peor", "suficiente", "no soy suficiente",
    "envidia", "tengo envidia", "siento envidia", "mejor que yo", "logros", "logros ajenos",
    "exitoso", "exitosa", "más exitosa", "más avanzada", "ella sí puede", "él sí puede",
    "ellas sí", "ellos sí", "no llego", "no alcanzo", "nunca llego", "nunca alcanzo",
    "estoy atrasada", "atrasada", "me quedé atrás", "no estoy a la altura",
    "todos tienen", "todos menos yo", "menos que los demás"
  ],
  "Procrastinación": [
    "procrastino", "procrastinación", "no arranco", "no arrancé", "no puedo empezar",
    "evito", "postergo", "no me muevo", "no me animo", "no empiezo", "siempre lo dejo",
    "dejo para mañana", "mañana lo hago", "nunca termino", "no lo hago", "no arranco nunca",
    "evitar", "huir", "escapar de", "no puedo con", "me bloqueo", "bloqueada",
    "paralizada y no hago", "no me sale arrancar", "dejé de hacer", "abandoné",
    "no terminé", "a medias", "empecé y dejé"
  ],
  "Ansiedad física": [
    "ansiedad", "tiemblo", "latidos", "me ahogo", "tensión", "paralizo", "pánico",
    "angustia", "nervios", "respirar", "me asfixia", "me aprieta el pecho", "angustiada",
    "miedo de", "le tengo miedo", "me da miedo", "me da pánico", "fobia",
    "estresada", "estrés", "agobiada", "agobio", "agotamiento", "no puedo respirar",
    "se me cierra la garganta", "se me va la cabeza", "me mareo", "mareada",
    "siento presión", "me presiona", "me oprime", "no puedo parar", "estoy desbordada",
    "desbordada", "colapsé", "colapso", "al límite", "no aguanto más"
  ],
  "Descanso y culpa": [
    "descanso", "culpa", "culpable", "me siento culpable", "soy una vaga", "vaga",
    "no hago nada", "produciendo", "perdiendo el tiempo", "debería hacer", "holgazana",
    "no produje", "no produzco", "soy floja", "floja", "no sirvo para nada",
    "no aporto nada", "debería estar haciendo", "tendría que estar haciendo",
    "no tendría que estar descansando", "no me merezco descansar", "descansé y me siento mal",
    "estoy tirada", "no hice nada útil", "día perdido", "perdí el día",
    "inútil", "me siento inútil", "no sirvo", "qué hice hoy"
  ],
  "Límites difíciles": [
    "límites", "no sé decir no", "cedí", "culpable por negarme", "no puedo negarme",
    "siempre digo sí", "dije que sí aunque no quería", "no me animé a negarme",
    "cedí a la presión", "me comprometí sin querer", "no pude decir no",
    "presión", "me presionan", "no me respetan", "avasallaron", "me pisaron",
    "no me escuchan", "no escucha mis límites", "me hicieron hacer", "me obligaron",
    "no pude negarme", "no supe cómo decir que no", "me cuesta decir no",
    "siempre cedo", "termino haciendo lo que otros quieren", "no defiendo lo que quiero"
  ],
  "Redes y opiniones": [
    "redes", "opinión", "qué dirán", "qué dirá", "qué pensarán", "qué pensará",
    "juzgan", "me juzgan", "critican", "me critican", "exposición", "instagram",
    "redes sociales", "seguidores", "likes", "qué van a pensar", "qué van a decir",
    "miedo a que digan", "vergüenza de mostrar", "vergüenza de publicar",
    "miedo al qué dirán", "van a pensar que", "me da vergüenza mostrarme",
    "mostrarme", "visibilidad", "me ven", "no quiero que me vean", "exponerme",
    "comentarios", "comentario", "dijeron que", "dijeron de mí", "hablan de mí",
    "hablan mal", "la gente dice", "qué dice la gente", "me importa lo que digan"
  ],
  "Pareja y vínculos": [
    "pareja", "relación", "vínculo", "mi pareja", "me abandona", "amor", "novio", "novia",
    "marido", "esposo", "esposa", "me decepcionó", "me dejó", "nos peleamos", "pelea",
    "discutimos", "discusión", "no me entiende", "me lastima", "me dolió lo que dijo",
    "decepción", "decepcionada", "me decepcionaste", "me siento sola en la relación",
    "amigas", "amigos", "me dejaron", "no me llaman", "no me escriben", "soledad",
    "sola", "me siento sola", "abandono", "rechazada", "rechazo", "me rechazaron",
    "no me quieren", "no les importo", "nadie me elige", "me traicionaron",
    "me hicieron daño", "me duele la relación", "vínculos difíciles"
  ],
  "Cuidadora": [
    "maternidad", "hijos", "hija", "hijo", "cuidado", "no soy buena madre", "mamá",
    "crianza", "agotada de cuidar", "cuidadora", "soy mala madre", "mala mamá",
    "no estoy siendo buena mamá", "no puedo con mis hijos", "les fallé a mis hijos",
    "no doy abasto", "mis hijos merecen más", "no tengo energía para ellos",
    "cuido a", "cuido a alguien", "cuidado de mis padres", "mis padres", "mi mamá enferma",
    "mi papá", "cuido a mi mamá", "cuido a mi papá", "familiar enfermo",
    "agotada de ser mamá", "no llego como mamá", "no llego como cuidadora"
  ],
  "Dinero": [
    "dinero", "plata", "deudas", "deuda", "no gano", "finanzas", "económico", "gasté",
    "no llego a fin de mes", "sueldo", "no tengo dinero", "no tengo plata",
    "me quedé sin plata", "me gasté todo", "no me alcanza", "no alcanza",
    "gastos", "no puedo pagar", "cobro poco", "gano poco", "no me llega",
    "me falta dinero", "me falta plata", "debo", "debo dinero", "le debo",
    "no puedo ahorrar", "sin ahorros", "no llego con los gastos", "crisis económica"
  ],
  "Rendimiento y estudio": [
    "rendimiento", "estudio", "notas", "no aprendo", "no rindo", "académico",
    "examen", "materias", "me va mal", "me fue mal", "reprobé", "desaprobé",
    "no entiendo", "no aprendo nada", "me va pésimo", "me cuesta estudiar",
    "me cuesta aprender", "no puedo estudiar", "no me concentro estudiando",
    "no lo puedo aprender", "demasiado para estudiar", "no sé cómo estudiar",
    "no sirvo para el estudio", "no soy buena estudiante", "fracasé en la facultad",
    "abandoné la carrera", "dejé la carrera", "carrera"
  ],
  "Trabajo y proyectos": [
    "trabajo", "proyecto", "laboral", "jefa", "jefe", "equipo", "profesional",
    "trabajo mal", "no rindo en el trabajo", "empleada", "me retaron", "me llamaron la atención",
    "cometí un error en el trabajo", "me siento mal en el trabajo", "no rindo en el laburo",
    "no sirvo para esto", "no me sale", "reunión", "cliente", "presentación",
    "me fue mal en el trabajo", "me echaron", "me despidieron", "perder el trabajo",
    "no encontro trabajo", "sin trabajo", "desempleo", "desocupada",
    "no me sale el proyecto", "no termino el proyecto", "no avanzo con el proyecto",
    "emprendimiento", "negocio", "no vendo", "no me va bien con el negocio"
  ],
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

// Normaliza texto: minúsculas y sin tildes. Así "decepción" == "decepcion".
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function matchContext(feeling: string): string {
  const text = normalize(feeling);
  const scores: Record<string, number> = {};

  for (const [ctx, keywords] of Object.entries(CONTEXT_KEYWORDS)) {
    scores[ctx] = keywords.reduce((acc, kw) => acc + (text.includes(normalize(kw)) ? 1 : 0), 0);
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  // Si no hay ninguna coincidencia, usamos "Descanso y culpa" como fallback neutral.
  if (best[1] === 0) {
    return "Descanso y culpa";
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
