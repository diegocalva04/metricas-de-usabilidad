-- Ejecutar en Supabase > SQL Editor.
create table if not exists public.evaluaciones (
  id text primary key,
  tipo text not null check (tipo in ('formulario', 'busqueda', 'tabla', 'boton', 'navegacion')),
  tarea text not null,
  evaluador text not null,
  fecha timestamptz not null default now(),
  duracion_segundos integer not null check (duracion_segundos >= 0),
  nivel_satisfaccion integer not null check (nivel_satisfaccion between 1 and 5),
  metricas_cuantitativas jsonb not null default '{}'::jsonb,
  metricas_cualitativas jsonb not null default '{}'::jsonb,
  indice_usabilidad integer not null check (indice_usabilidad between 0 and 100),
  estado text not null default 'Completada' check (estado in ('Completada', 'En progreso'))
);

alter table public.evaluaciones enable row level security;
alter table public.evaluaciones replica identity full;

-- Politicas de demo académica. En producción deben sustituirse por políticas autenticadas.
drop policy if exists "demo puede consultar evaluaciones" on public.evaluaciones;
create policy "demo puede consultar evaluaciones"
  on public.evaluaciones for select to anon, authenticated using (true);

drop policy if exists "demo puede registrar evaluaciones" on public.evaluaciones;
create policy "demo puede registrar evaluaciones"
  on public.evaluaciones for insert to anon, authenticated with check (true);

drop policy if exists "demo puede actualizar evaluaciones" on public.evaluaciones;
create policy "demo puede actualizar evaluaciones"
  on public.evaluaciones for update to anon, authenticated using (true) with check (true);

drop policy if exists "demo puede eliminar evaluaciones" on public.evaluaciones;
create policy "demo puede eliminar evaluaciones"
  on public.evaluaciones for delete to anon, authenticated using (true);

-- Habilita INSERT/UPDATE/DELETE en el canal Postgres Changes.
do $$
begin
  alter publication supabase_realtime add table public.evaluaciones;
exception
  when duplicate_object then null;
end $$;

create index if not exists evaluaciones_fecha_idx on public.evaluaciones (fecha desc);
create index if not exists evaluaciones_tipo_idx on public.evaluaciones (tipo);
