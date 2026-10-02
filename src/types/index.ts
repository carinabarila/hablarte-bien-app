/**
 * Tipos de dominio de "Hablarte Bien".
 *
 * `Database` describe el esquema de Supabase (ver supabase/migrations/schema.sql)
 * en el formato que espera @supabase/supabase-js para tipar el cliente.
 * Cuando el proyecto esté linkeado a Supabase, este tipo puede regenerarse con:
 *   npx supabase gen types typescript --project-id <id> > src/types/index.ts
 */

export type Profile = {
  id: string; // uuid, references auth.users
  email: string;
  anchor_values: string[]; // top 3 valores ancla elegidos en /valores
  created_at: string;
};

export type Module = {
  id: number;
  title: string; // ej. "Hablarte Bien Volumen 1"
  description: string | null;
};

export type Context = {
  id: number;
  module_id: number;
  name: string; // ej. "Error", "Comparación", "Procrastinación", "Dinero"...
  page_reference: number | null;
};

export type Script = {
  id: number; // 1..74, secuencial
  context_id: number;
  voz_critica: string; // paso 1: el pensamiento autocrítico
  respuesta_compasiva: string; // paso 2: la respuesta compasiva
  valor_asociado: string; // paso 3: el valor con el que conecta
  anclaje: string; // paso 4: la frase de anclaje
};

export type JournalLog = {
  id: string; // uuid
  user_id: string;
  script_id: number;
  raw_user_feeling: string;
  user_reflection_text: string | null;
  ai_empathetic_response: string | null;
  created_at: string;
};

/** Helper genérico: las columnas en InsertOptional no son obligatorias al insertar. */
type TableDef<Row, InsertOptional extends keyof Row = never> = {
  Row: Row;
  Insert: Omit<Row, InsertOptional> & Partial<Pick<Row, InsertOptional>>;
  Update: Partial<Row>;
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile, "anchor_values" | "created_at">;
      modules: TableDef<Module, "id">;
      contexts: TableDef<Context, "id">;
      scripts: TableDef<Script, "id">;
      journal_logs: TableDef<JournalLog, "id" | "created_at">;
    };
  };
};
