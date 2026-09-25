import jsPDF from 'jspdf'
import type { EvaluacionDTO } from '../domain/EvaluacionUsabilidad'

export function generarReportePDF(evaluaciones: EvaluacionDTO[]): void {
  const documento = new jsPDF({ unit: 'mm', format: 'a4' })
  const promedio = evaluaciones.length
    ? Math.round(evaluaciones.reduce((total, evaluacion) => total + evaluacion.indiceUsabilidad, 0) / evaluaciones.length)
    : 0

  documento.setFillColor(15, 23, 42)
  documento.rect(0, 0, 210, 42, 'F')
  documento.setTextColor(255, 255, 255)
  documento.setFont('helvetica', 'bold')
  documento.setFontSize(21)
  documento.text('METRICAS DE USABILIDAD', 16, 20)
  documento.setFont('helvetica', 'normal')
  documento.setFontSize(10)
  documento.text('Reporte ejecutivo de evaluación | ' + new Date().toLocaleDateString('es-ES'), 16, 29)

  documento.setTextColor(15, 23, 42)
  documento.setFontSize(12)
  documento.text('Resumen de la sesión', 16, 56)
  documento.setFontSize(10)
  documento.text(`Evaluaciones registradas: ${evaluaciones.length}`, 16, 66)
  documento.text(`Índice promedio: ${promedio}/100`, 16, 73)
  documento.text('Este documento consolida métricas cuantitativas y cualitativas recogidas durante la exposición.', 16, 80)

  let y = 96
  documento.setFillColor(226, 232, 240)
  documento.rect(16, y - 7, 178, 9, 'F')
  documento.setFont('helvetica', 'bold')
  documento.text('Tarea', 18, y - 1)
  documento.text('Índice', 145, y - 1)
  documento.text('Tiempo', 172, y - 1)
  documento.setFont('helvetica', 'normal')
  y += 9

  evaluaciones.forEach((evaluacion) => {
    if (y > 270) {
      documento.addPage()
      y = 20
    }
    documento.text(evaluacion.tarea.slice(0, 58), 18, y)
    documento.text(`${evaluacion.indiceUsabilidad}/100`, 145, y)
    documento.text(`${evaluacion.duracionSegundos}s`, 174, y)
    documento.setDrawColor(226, 232, 240)
    documento.line(16, y + 3, 194, y + 3)
    y += 10
  })

  documento.setFontSize(9)
  documento.setTextColor(100, 116, 139)
  documento.text('Generado por Métricas de Usabilidad', 16, 286)
  documento.save(`reporte-usabilidad-${new Date().toISOString().slice(0, 10)}.pdf`)
}
