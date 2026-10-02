-- ============================================================================
-- Hablarte Bien — Schema (profiles, modules, contexts, scripts, journal_logs)
-- Fase 2.1 del plano técnico (TODO.md) — Estructura modular: Valores + 12 Contextos
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Reset de tablas cuya forma cambió respecto al borrador anterior.
-- (modules/contexts son nuevas; scripts y journal_logs reemplazan el diseño
--  previo de "scripts" + "reflections"). profiles se conserva y se migra.
-- ----------------------------------------------------------------------------
drop table if exists public.journal_logs cascade;
drop table if exists public.reflections cascade;
drop table if exists public.scripts cascade;
drop table if exists public.contexts cascade;
drop table if exists public.modules cascade;

-- ----------------------------------------------------------------------------
-- TABLE: profiles
-- Espejo 1:1 de auth.users + valores ancla elegidos en /valores.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null,
  anchor_values text[] not null default '{}',
  created_at    timestamptz not null default now()
);

-- Migra perfiles creados con el esquema anterior (sin anchor_values).
alter table public.profiles
  add column if not exists anchor_values text[] not null default '{}';

alter table public.profiles enable row level security;

drop policy if exists "Los usuarios pueden ver su propio perfil" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Los usuarios pueden actualizar su propio perfil" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Crea automáticamente una fila en profiles cuando alguien se registra en auth.users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- TABLE: modules
-- Agrupador de alto nivel (ej. "Hablarte Bien Volumen 1").
-- ----------------------------------------------------------------------------
create table public.modules (
  id          bigint generated always as identity primary key,
  title       text not null,
  description text
);

alter table public.modules enable row level security;

create policy "modules_public_read"
  on public.modules for select
  using (true);

-- ----------------------------------------------------------------------------
-- TABLE: contexts
-- Los 12 contextos psicológicos del libro (Error, Comparación, Procrastinación,
-- Ansiedad física, Descanso y culpa, Límites difíciles, Redes y opiniones,
-- Pareja y vínculos, Maternidad y cuidado, Dinero, Rendimiento y estudio, etc.).
-- ----------------------------------------------------------------------------
create table public.contexts (
  id             bigint generated always as identity primary key,
  module_id      bigint not null references public.modules (id) on delete cascade,
  name           text not null,
  page_reference integer
);

create index contexts_module_id_idx on public.contexts (module_id);

alter table public.contexts enable row level security;

create policy "contexts_public_read"
  on public.contexts for select
  using (true);

-- ----------------------------------------------------------------------------
-- TABLE: scripts
-- Los ~74 guiones. Cada uno ya viene estructurado en sus 4 pasos nativos:
-- voz_critica -> respuesta_compasiva -> valor_asociado -> anclaje.
-- Lectura pública, escritura reservada al rol de servicio (seed / admin).
-- ----------------------------------------------------------------------------
create table public.scripts (
  id                  bigint generated always as identity primary key,
  context_id          bigint not null references public.contexts (id) on delete cascade,
  voz_critica         text not null,
  respuesta_compasiva text not null,
  valor_asociado      text not null,
  anclaje             text not null
);

create index scripts_context_id_idx on public.scripts (context_id);

alter table public.scripts enable row level security;

create policy "scripts_public_read"
  on public.scripts for select
  using (true);

-- ----------------------------------------------------------------------------
-- TABLE: journal_logs
-- Historial de reflexiones de cada usuario sobre un guion puntual.
-- ----------------------------------------------------------------------------
create table public.journal_logs (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles (id) on delete cascade,
  script_id               bigint not null references public.scripts (id) on delete cascade,
  raw_user_feeling        text not null,
  user_reflection_text    text,
  ai_empathetic_response  text,
  created_at              timestamptz not null default now()
);

create index journal_logs_user_id_idx on public.journal_logs (user_id);
create index journal_logs_script_id_idx on public.journal_logs (script_id);

alter table public.journal_logs enable row level security;

create policy "journal_logs_select_own"
  on public.journal_logs for select
  using (auth.uid() = user_id);

create policy "journal_logs_insert_own"
  on public.journal_logs for insert
  with check (auth.uid() = user_id);

create policy "journal_logs_update_own"
  on public.journal_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
