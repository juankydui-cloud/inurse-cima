/** Modelo de datos de las calculadoras clínicas. */

export type Level = 'ok' | 'info' | 'warn' | 'danger'

export interface Option {
  label: string
  /** Valor que se guarda (en escalas de puntos, los puntos de la opción). Debe ser único dentro del select. */
  value: number
  description?: string
}

export type CalcInput =
  | {
      id: string
      type: 'number'
      label: string
      description?: string
      unit?: string
      min?: number
      max?: number
      step?: number
    }
  | {
      id: string
      type: 'boolean'
      label: string
      description?: string
      /** Puntos que aporta la respuesta «Sí» (por defecto 1). */
      points?: number
      /** Etiquetas de los dos botones (por defecto «No» / «Sí»). */
      labels?: [string, string]
      /** Ocultar la insignia de puntos (para entradas que no puntúan). */
      noPoints?: boolean
    }
  | {
      id: string
      type: 'select'
      label: string
      description?: string
      options: Option[]
      /** Mostrar como desplegable en lugar de botones segmentados. */
      dropdown?: boolean
      /** Valor preseleccionado (por defecto, la primera opción). */
      default?: number
      /** Ocultar la insignia de puntos (para entradas que no puntúan). */
      noPoints?: boolean
    }

export interface CalcResult {
  /** Valor principal, p. ej. «7». */
  main: string
  /** Unidad del valor principal, p. ej. «puntos» o «mmHg». */
  mainUnit?: string
  /** Valor secundario, p. ej. «39 %». */
  secondary?: string
  secondaryLabel?: string
  interpretation: string
  level?: Level
  details?: string[]
}

export type Values = Record<string, number | undefined>

export interface Calculator {
  id: string
  name: string
  shortName?: string
  description: string
  category: string
  specialty: string[]
  inputs: CalcInput[]
  compute: (v: Values) => CalcResult | null
  notes?: string[]
  references?: string[]
}

/** Suma los valores guardados de una lista de entradas (los booleanos ya guardan sus puntos). */
export const sum = (v: Values, ids: string[]): number =>
  ids.reduce((acc, id) => acc + (v[id] ?? 0), 0)

/** Formatea un número en estilo español (coma decimal). */
export const fmt = (n: number, dec = 0): string =>
  n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: dec })
