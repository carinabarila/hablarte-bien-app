import { createClient, type Session } from "@supabase/supabase-js";
import type { Database } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  // No usamos `throw` para no romper el build estático (SSG/prerender) cuando
  // todavía no hay .env.local — ver .env.example. En runtime, si faltan estas
  // variables, las llamadas a Supabase fallarán de forma visible en consola.
  console.warn(
    "Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Configuralas en .env.local (ver .env.example)."
  );
}

/**
 * Cliente único de Supabase para uso en el browser (componentes "use client")
 * y en Route Handlers que no requieran privilegios de service_role.
 */
export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Suscripción segura a cambios de sesión (login, logout, refresh de token).
 * Devuelve "unsubscribe" para limpiar el listener (ej. dentro de un useEffect).
 *
 *   useEffect(() => onAuthStateChange(setSession), []);
 */
export function onAuthStateChange(callback: (session: Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => data.subscription.unsubscribe();
}

/**
 * Devuelve la sesión activa revalidando el usuario contra el servidor de Supabase
 * (auth.getUser) en lugar de confiar ciegamente en lo que haya en el storage local.
 * Usar esta función en vez de supabase.auth.getSession() cuando el resultado
 * habilite acceso a datos o rutas protegidas.
 */
export async function getSecureSession() {
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  return sessionData.session;
}
