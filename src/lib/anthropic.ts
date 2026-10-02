import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY ?? "";

if (!apiKey) {
  // No lanzamos error para no romper el build estático.
  // En runtime, las llamadas fallarán de forma visible en consola.
  console.warn("Falta ANTHROPIC_API_KEY. Configurala en .env.local (ver .env.example).");
}

/**
 * Cliente único de Anthropic (Claude 3.5 Sonnet).
 * Usar exclusivamente en Route Handlers (server-side) — nunca en componentes cliente.
 */
export const anthropic = new Anthropic({ apiKey: apiKey || "placeholder" });

/** Modelo por defecto para toda la app. */
export const MODEL = "claude-3-5-sonnet-20241022";

/** Límites de tokens para mantener costos bajo control. */
export const TOKEN_LIMITS = {
  contextRouter: 256,   // analyze-context: solo necesita devolver un JSON pequeño
  journalReply: 512,    // process-journal: respuesta empática corta (2-3 oraciones)
} as const;
