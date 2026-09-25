# Métricas de Usabilidad

Dashboard académico para registrar y analizar pruebas de usabilidad en tiempo real.

## Cómo funciona

La aplicación centraliza los resultados de una sesión de investigación UX. Cada evaluación representa a una persona realizando una tarea concreta y combina métricas cuantitativas con observaciones cualitativas.

### Flujo de una evaluación

1. Desde **Nueva evaluación**, se selecciona el tipo de tarea: formulario, búsqueda, tabla, botón o navegación.
2. Se registra el evaluador y los datos observados: tiempo empleado, cantidad de clics, tasa de error, nivel de satisfacción, frustración y comentarios.
3. Al guardar, el sistema crea una evaluación con fecha, estado e identificador. El índice de usabilidad se calcula automáticamente según el tipo de tarea.
4. La evaluación aparece inmediatamente en el resumen y en el registro de actividad. Los indicadores generales se recalculan con todos los resultados disponibles.
5. Los resultados pueden buscarse por tarea, persona o comentario, filtrarse por tipo, tasa de error e índice mínimo, y exportarse a un reporte PDF.

### Qué muestra el dashboard

- **Resumen:** índice promedio, tiempo promedio, tasa de error, cantidad de evaluaciones y rendimiento por tipo de tarea.
- **Evaluaciones:** listado detallado de tareas, evaluadores, tiempos, errores e índices individuales.
- **Participantes:** personas evaluadas y cantidad de pruebas completadas por cada una.
- **Métricas de éxito:** comparación con los objetivos de la sesión, como índice promedio mínimo de 80 y tasa de error menor al 5 %.
- **Historial:** consulta de los registros guardados con las mismas herramientas de búsqueda y filtrado.

### Cómo se calcula el índice

El dominio usa una clase base `EvaluacionUsabilidad` y una implementación específica para cada tipo de tarea. Todas las fórmulas producen un valor entre 0 y 100:

- **Formulario:** pondera velocidad, precisión y satisfacción.
- **Botón:** pondera tiempo de respuesta, esfuerzo medido por clics y precisión.
- **Navegación:** pondera orientación, velocidad y nivel de frustración.
- **Búsqueda y tabla:** usan una fórmula general basada en precisión, velocidad y satisfacción.

El promedio del resumen es la media de los índices individuales. Por eso, mejorar el tiempo, reducir errores o aumentar la satisfacción puede cambiar tanto el resultado de una evaluación como los indicadores de la sesión.

### Dónde se guardan los datos

La aplicación tiene dos modos de funcionamiento:

- **Sin Supabase:** utiliza el dataset inicial de `src/data/mockData.ts` y mantiene los nuevos registros en la sesión actual del navegador.
- **Con Supabase:** lee y guarda las evaluaciones en la tabla `evaluaciones`. También escucha eventos Realtime, por lo que un registro creado, actualizado o eliminado se refleja en las pestañas conectadas.

La capa `EvaluacionRepository` oculta esta diferencia para que el dashboard trabaje con el mismo formato de datos en ambos modos. La creación de una evaluación pasa por `crearEvaluacion()`, que selecciona la fórmula correspondiente mediante polimorfismo.

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

## Validación

- `npm run build` compila TypeScript y genera `dist/` correctamente.
- `npm run lint` ejecuta Oxlint.
