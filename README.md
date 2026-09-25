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

La tabla `evaluaciones` debe aceptar las columnas del tipo `EvaluacionDTO` y tener Realtime habilitado.

## Estructura

```text
src/
  domain/EvaluacionUsabilidad.ts  # abstracción, herencia y polimorfismo
  data/mockData.ts                 # dataset para la exposición
  services/supabase.ts             # repositorio y suscripción Realtime
  services/reportService.ts        # exportación con jsPDF
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
