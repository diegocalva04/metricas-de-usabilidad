import { createClient, type RealtimePostgresChangesPayload, type SupabaseClient } from '@supabase/supabase-js'
import { evaluacionesIniciales } from '../data/mockData'
import { hidratarEvaluacion, type EvaluacionDTO } from '../domain/EvaluacionUsabilidad'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

type EvaluacionRow = {
  id: string
  tipo: EvaluacionDTO['tipo']
  tarea: string
  evaluador: string
  fecha: string
  duracion_segundos: number
  nivel_satisfaccion: number
  metricas_cuantitativas: EvaluacionDTO['metricasCuantitativas']
  metricas_cualitativas: EvaluacionDTO['metricasCualitativas']
  indice_usabilidad: number
  estado: EvaluacionDTO['estado']
}

export type EvaluacionListener = (evaluaciones: EvaluacionDTO[]) => void

function toRow(evaluacion: EvaluacionDTO): EvaluacionRow {
  return {
    id: evaluacion.id,
    tipo: evaluacion.tipo,
    tarea: evaluacion.tarea,
    evaluador: evaluacion.evaluador,
    fecha: evaluacion.fecha,
    duracion_segundos: evaluacion.duracionSegundos,
    nivel_satisfaccion: evaluacion.nivelSatisfaccion,
    metricas_cuantitativas: evaluacion.metricasCuantitativas,
    metricas_cualitativas: evaluacion.metricasCualitativas,
    indice_usabilidad: evaluacion.indiceUsabilidad,
    estado: evaluacion.estado,
  }
}

function fromRow(row: EvaluacionRow): EvaluacionDTO {
  return hidratarEvaluacion({
    id: row.id,
    tipo: row.tipo,
    tarea: row.tarea,
    evaluador: row.evaluador,
    fecha: row.fecha,
    duracionSegundos: row.duracion_segundos,
    nivelSatisfaccion: row.nivel_satisfaccion,
    metricasCuantitativas: row.metricas_cuantitativas,
    metricasCualitativas: row.metricas_cualitativas,
    indiceUsabilidad: row.indice_usabilidad,
    estado: row.estado,
  }).toDTO()
}

export class EvaluacionRepository {
  private evaluaciones: EvaluacionDTO[] = evaluacionesIniciales.map((evaluacion) => hidratarEvaluacion(evaluacion).toDTO())
  private readonly listeners = new Set<EvaluacionListener>()
  private realtimeChannel: ReturnType<NonNullable<SupabaseClient>['channel']> | null = null

  public async listar(): Promise<EvaluacionDTO[]> {
    if (!supabase) return this.evaluaciones

    const { data, error } = await supabase.from('evaluaciones').select('*').order('fecha', { ascending: false })
    if (error || !data) {
      console.warn('Supabase no disponible; se mantienen los datos simulados.', error?.message)
      return this.evaluaciones
    }
    this.evaluaciones = (data as EvaluacionRow[]).map(fromRow)
    return this.evaluaciones
  }

  public async crear(evaluacion: EvaluacionDTO): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('evaluaciones').insert(toRow(evaluacion))
      if (error) {
        console.warn('No se pudo guardar en Supabase; se mantiene la sesión local.', error.message)
      }
    }
    this.evaluaciones = [evaluacion, ...this.evaluaciones.filter((item) => item.id !== evaluacion.id)]
    this.emitir()
  }

  public suscribirse(listener: EvaluacionListener): () => void {
    this.listeners.add(listener)
    if (supabase && !this.realtimeChannel) {
      this.realtimeChannel = supabase
        .channel('evaluaciones-en-tiempo-real')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'evaluaciones' }, (payload: RealtimePostgresChangesPayload<EvaluacionRow>) => {
          if (payload.eventType === 'INSERT') this.evaluaciones = [fromRow(payload.new), ...this.evaluaciones.filter((item) => item.id !== payload.new.id)]
          if (payload.eventType === 'UPDATE') this.evaluaciones = this.evaluaciones.map((item) => item.id === payload.new.id ? fromRow(payload.new) : item)
          if (payload.eventType === 'DELETE') this.evaluaciones = this.evaluaciones.filter((item) => item.id !== payload.old.id)
          this.emitir()
        })
        .subscribe()
    }
    return () => this.listeners.delete(listener)
  }

  private emitir(): void {
    this.listeners.forEach((listener) => listener([...this.evaluaciones]))
  }
}
