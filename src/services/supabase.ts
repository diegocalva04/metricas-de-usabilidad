import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { evaluacionesIniciales } from '../data/mockData'
import { hidratarEvaluacion, type EvaluacionDTO } from '../domain/EvaluacionUsabilidad'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type EvaluacionListener = (evaluaciones: EvaluacionDTO[]) => void

export class EvaluacionRepository {
  private evaluaciones: EvaluacionDTO[] = evaluacionesIniciales.map((evaluacion) => hidratarEvaluacion(evaluacion).toDTO())
  private readonly listeners = new Set<EvaluacionListener>()
  private realtimeChannel: ReturnType<NonNullable<SupabaseClient>['channel']> | null = null

  public async listar(): Promise<EvaluacionDTO[]> {
    if (!supabase) return this.evaluaciones

    const { data, error } = await supabase.from('evaluaciones').select('*').order('fecha', { ascending: false })
    if (error || !data) return this.evaluaciones
    this.evaluaciones = data as EvaluacionDTO[]
    return this.evaluaciones
  }

  public async crear(evaluacion: EvaluacionDTO): Promise<void> {
    if (supabase) {
      await supabase.from('evaluaciones').insert(evaluacion)
    }
    this.evaluaciones = [evaluacion, ...this.evaluaciones]
    this.emitir()
  }

  public suscribirse(listener: EvaluacionListener): () => void {
    this.listeners.add(listener)
    if (supabase && !this.realtimeChannel) {
      this.realtimeChannel = supabase
        .channel('evaluaciones-en-tiempo-real')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'evaluaciones' }, (payload) => {
          if (payload.eventType === 'INSERT') this.evaluaciones = [payload.new as EvaluacionDTO, ...this.evaluaciones]
          if (payload.eventType === 'UPDATE') this.evaluaciones = this.evaluaciones.map((item) => item.id === payload.new.id ? payload.new as EvaluacionDTO : item)
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
