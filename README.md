# Métricas de Usabilidad

Dashboard académico para registrar y analizar pruebas de usabilidad en tiempo real.

## Ejecutar

```bash
npm install
npm run dev
```

La aplicación funciona con datos simulados cuando no existen credenciales de Supabase. Para activar persistencia y Realtime, crea `.env.local`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
```

La configuración completa de la tabla está en [supabase/schema.sql](supabase/schema.sql).

### Configurar Supabase

1. Entra en [supabase.com](https://supabase.com), crea un proyecto nuevo y espera a que termine de provisionarse.
2. Abre **SQL Editor**, pega el contenido de `supabase/schema.sql` y pulsa **Run**.
3. En **Project Settings > API**, copia la URL del proyecto y la clave pública `anon`.
4. Copia `.env.example` como `.env.local` y reemplaza sus valores:

```powershell
Copy-Item .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
```

5. Reinicia `npm run dev`. La app dejará de usar el dataset local y leerá `evaluaciones` desde Supabase.
6. Abre dos pestañas del dashboard. Al registrar una evaluación en una, la otra debe actualizarse mediante Realtime.

La política SQL incluida permite el acceso anónimo porque esta es una demo académica. Para producción, activa Supabase Auth y cambia las políticas RLS para exigir `authenticated`.

## Desplegar en Vercel

El proyecto incluye [vercel.json](vercel.json) con el comando de build y la salida `dist`.

1. Entra en [vercel.com/new](https://vercel.com/new) e inicia sesión con GitHub.
2. Importa `diegocalva04/metricas-de-usabilidad`.
3. Mantén los valores detectados por Vercel: framework **Vite**, build `npm run build` y output `dist`.
4. En **Environment Variables**, agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los valores de tu proyecto Supabase. Activa **Production**, **Preview** y **Development** si quieres que todos los despliegues usen la base.
5. Pulsa **Deploy**. Cada `git push` posterior generará un nuevo despliegue.
6. En Supabase, agrega el dominio de Vercel en **Authentication > URL Configuration** si después incorporas login.

No subas `.env.local` ni claves `service_role`. `.env.example` contiene únicamente placeholders; las variables reales deben configurarse en Vercel.

## Estructura

```text
src/
  domain/EvaluacionUsabilidad.ts  # abstracción, herencia y polimorfismo
  data/mockData.ts                 # dataset para la exposición
  services/supabase.ts             # repositorio y suscripción Realtime
  services/reportService.ts        # exportación con jsPDF
supabase/
  schema.sql                       # tabla, RLS, índices y publicación Realtime
.env.example                       # variables públicas requeridas
  App.tsx                          # dashboard y flujo de registro
  App.css                          # identidad visual Dark Corporate
```

## Arquitectura POO

`EvaluacionUsabilidad` define el contrato común. `EvaluacionFormulario`, `EvaluacionBoton` y `EvaluacionNavegacion` sobrescriben `calcularIndiceUsabilidad()` con fórmulas específicas; búsqueda y tabla usan `EvaluacionGenerica`. `crearEvaluacion()` funciona como fábrica polimórfica.

## Historial Git simulado

```bash
git commit -m "feat: inicializar dashboard React con TypeScript"
git commit -m "feat: modelar evaluaciones de usabilidad con POO"
git commit -m "feat: agregar métricas cuantitativas y cualitativas"
git commit -m "feat: integrar repositorio local y cliente Supabase"
git commit -m "feat: habilitar suscripciones de evaluaciones en tiempo real"
git commit -m "feat: construir resumen visual Dark Corporate"
git commit -m "feat: agregar formulario de registro de tareas"
git commit -m "feat: incorporar exportación de reportes PDF"
git commit -m "refactor: separar dominio servicios y presentación"
git commit -m "docs: documentar instalación arquitectura y configuración"
```

## Validación

- `npm run build` compila TypeScript y genera `dist/` correctamente.
- `npm run lint` ejecuta Oxlint.
