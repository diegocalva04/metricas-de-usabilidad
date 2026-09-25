export type TipoEvaluacion =
  | 'formulario'
  | 'busqueda'
  | 'tabla'
  | 'boton'
  | 'navegacion'

export interface MetricasCuantitativas {
  tiempoSegundos: number
  clics: number
  tasaError: number
}

export interface MetricasCualitativas {
  frustracion: number
  comentarios: string
}

export interface EvaluacionDTO {
  id: string
  tipo: TipoEvaluacion
  tarea: string
  evaluador: string
  fecha: string
  duracionSegundos: number
  nivelSatisfaccion: number
  metricasCuantitativas: MetricasCuantitativas
  metricasCualitativas: MetricasCualitativas
  indiceUsabilidad: number
  estado: 'Completada' | 'En progreso'
}

export abstract class EvaluacionUsabilidad {
  public readonly id: string
  public readonly evaluador: string
  public readonly fecha: Date
  public readonly duracionSegundos: number
  public readonly nivelSatisfaccion: number
  public readonly metricas: MetricasCuantitativas
  public readonly experiencia: MetricasCualitativas
  public readonly tipo: TipoEvaluacion
  public readonly tarea: string

  public constructor(
    datos: Omit<EvaluacionDTO, 'indiceUsabilidad' | 'estado'>,
  ) {
    this.id = datos.id
    this.tipo = datos.tipo
    this.tarea = datos.tarea
    this.evaluador = datos.evaluador
    this.fecha = new Date(datos.fecha)
    this.duracionSegundos = datos.duracionSegundos
    this.nivelSatisfaccion = datos.nivelSatisfaccion
    this.metricas = datos.metricasCuantitativas
    this.experiencia = datos.metricasCualitativas
  }

  public abstract calcularIndiceUsabilidad(): number

  public get estado(): EvaluacionDTO['estado'] {
    return 'Completada'
  }

  public toDTO(): EvaluacionDTO {
    return {
      id: this.id,
      tipo: this.tipo,
      tarea: this.tarea,
      evaluador: this.evaluador,
      fecha: this.fecha.toISOString(),
      duracionSegundos: this.duracionSegundos,
      nivelSatisfaccion: this.nivelSatisfaccion,
      metricasCuantitativas: this.metricas,
      metricasCualitativas: this.experiencia,
      indiceUsabilidad: this.calcularIndiceUsabilidad(),
      estado: this.estado,
    }
  }

  protected limitarIndice(valor: number): number {
    return Math.max(0, Math.min(100, Math.round(valor)))
  }
}

export class EvaluacionFormulario extends EvaluacionUsabilidad {
  public calcularIndiceUsabilidad(): number {
    const velocidad = Math.max(0, 100 - this.duracionSegundos * 0.55)
    const precision = 100 - this.metricas.tasaError * 1.2
    const satisfaccion = this.nivelSatisfaccion * 10
    return this.limitarIndice(velocidad * 0.35 + precision * 0.3 + satisfaccion * 0.35)
  }
}

export class EvaluacionBoton extends EvaluacionUsabilidad {
  public calcularIndiceUsabilidad(): number {
    const tiempoDeRespuesta = Math.max(0, 100 - this.duracionSegundos * 1.8)
    const esfuerzo = Math.max(0, 100 - this.metricas.clics * 12)
    const precision = 100 - this.metricas.tasaError
    return this.limitarIndice(tiempoDeRespuesta * 0.5 + esfuerzo * 0.25 + precision * 0.25)
  }
}

export class EvaluacionNavegacion extends EvaluacionUsabilidad {
  public calcularIndiceUsabilidad(): number {
    const orientacion = Math.max(0, 100 - this.metricas.clics * 8)
    const velocidad = Math.max(0, 100 - this.duracionSegundos * 0.7)
    const calma = Math.max(0, 100 - this.experiencia.frustracion * 10)
    return this.limitarIndice(orientacion * 0.35 + velocidad * 0.3 + calma * 0.35)
  }
}

export class EvaluacionGenerica extends EvaluacionUsabilidad {
  public calcularIndiceUsabilidad(): number {
    const precision = 100 - this.metricas.tasaError
    const velocidad = Math.max(0, 100 - this.duracionSegundos * 0.45)
    return this.limitarIndice(precision * 0.4 + velocidad * 0.3 + this.nivelSatisfaccion * 10 * 0.3)
  }
}

export function crearEvaluacion(datos: Omit<EvaluacionDTO, 'indiceUsabilidad' | 'estado'>): EvaluacionUsabilidad {
  switch (datos.tipo) {
    case 'formulario':
      return new EvaluacionFormulario(datos)
    case 'boton':
      return new EvaluacionBoton(datos)
    case 'navegacion':
      return new EvaluacionNavegacion(datos)
    default:
      return new EvaluacionGenerica(datos)
  }
}

export function hidratarEvaluacion(datos: EvaluacionDTO): EvaluacionUsabilidad {
  return crearEvaluacion(datos)
}
