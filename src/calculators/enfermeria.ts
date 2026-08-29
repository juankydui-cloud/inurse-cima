import type { Calculator } from '../engine/types'

// Escalas de valoración enfermera portadas desde public/data/escalas.js
// (objeto CALCS). Hasta ahora se adaptaban al motor genérico en runtime
// (adaptarLegado en public/js/calculadoras/inurse-escalas-clinicas-js.js);
// ahora son ciudadanas de primera del catálogo con la misma salida.
//
// Barthel y RASS no se portan aquí porque el catálogo importado ya trae
// versiones más completas (neuro-critica.ts, neurocritico.ts) que son las
// que la sección Escalas mostraba en su lugar.
//
// Los títulos y los textos de interpretación se mantienen VERBATIM
// respecto a escalas.js (con el emoji de semáforo incluido) para que la
// experiencia visible no cambie. El `level` se declara explícitamente en
// lugar de deducirlo por regex del emoji, como hacía el adaptador.

const CAT = 'Valoración enfermera'
const ENF = ['Enfermería']

export const enfermeria: Calculator[] = [
  {
    id: 'norton',
    name: 'Norton (riesgo de UPP)',
    shortName: 'Norton',
    description:
      'Riesgo de úlceras por presión según estado físico, mental, actividad, movilidad e incontinencia.',
    category: CAT,
    specialty: ENF,
    inputs: [
      {
        id: 'fis',
        type: 'select',
        label: 'Estado físico general',
        dropdown: true,
        noPoints: true,
        options: [
          { value: 4, label: '4 — Bueno' },
          { value: 3, label: '3 — Mediano' },
          { value: 2, label: '2 — Regular' },
          { value: 1, label: '1 — Muy malo' },
        ],
      },
      {
        id: 'men',
        type: 'select',
        label: 'Estado mental',
        dropdown: true,
        noPoints: true,
        options: [
          { value: 4, label: '4 — Alerta' },
          { value: 3, label: '3 — Apático' },
          { value: 2, label: '2 — Confuso' },
          { value: 1, label: '1 — Estuporoso o comatoso' },
        ],
      },
      {
        id: 'act',
        type: 'select',
        label: 'Actividad',
        dropdown: true,
        noPoints: true,
        options: [
          { value: 4, label: '4 — Ambulante' },
          { value: 3, label: '3 — Camina con ayuda' },
          { value: 2, label: '2 — Sentado' },
          { value: 1, label: '1 — Encamado' },
        ],
      },
      {
        id: 'mov',
        type: 'select',
        label: 'Movilidad',
        dropdown: true,
        noPoints: true,
        options: [
          { value: 4, label: '4 — Total' },
          { value: 3, label: '3 — Disminuida' },
          { value: 2, label: '2 — Muy limitada' },
          { value: 1, label: '1 — Inmóvil' },
        ],
      },
      {
        id: 'inc',
        type: 'select',
        label: 'Incontinencia',
        dropdown: true,
        noPoints: true,
        options: [
          { value: 4, label: '4 — Ninguna' },
          { value: 3, label: '3 — Ocasional' },
          { value: 2, label: '2 — Urinaria o fecal' },
          { value: 1, label: '1 — Doble incontinencia' },
        ],
      },
    ],
    compute: (v) => {
      const fis = v.fis ?? 4
      const men = v.men ?? 4
      const act = v.act ?? 4
      const mov = v.mov ?? 4
      const inc = v.inc ?? 4
      const total = fis + men + act + mov + inc
      let interpretation: string
      let level: 'ok' | 'warn' | 'danger'
      if (total <= 12) {
        level = 'danger'
        interpretation =
          '🔴 Riesgo alto — superficie especial de manejo de presión, cambios posturales y revisión diaria de la piel'
      } else if (total <= 14) {
        level = 'warn'
        interpretation =
          '🟠 Riesgo medio — pauta de cambios posturales y protección de prominencias óseas'
      } else {
        level = 'ok'
        interpretation =
          '🟢 Riesgo mínimo — mantener vigilancia y reevaluar si cambia la situación'
      }
      return {
        main: `Norton ${total} / 20`,
        interpretation,
        level,
        details: [
          `Físico ${fis} · Mental ${men} · Actividad ${act} · Movilidad ${mov} · Incontinencia ${inc}`,
        ],
      }
    },
  },

  {
    id: 'morse',
    name: 'Morse (riesgo de caídas)',
    shortName: 'Morse',
    description: 'Riesgo de caídas durante el ingreso hospitalario.',
    category: CAT,
    specialty: ENF,
    inputs: [
      {
        id: 'ant',
        type: 'select',
        label: 'Antecedente de caídas recientes',
        dropdown: true,
        noPoints: true,
        options: [
          { value: 0, label: '0 — No' },
          { value: 25, label: '25 — Sí' },
        ],
      },
      {
        id: 'dx',
        type: 'select',
        label: 'Más de un diagnóstico médico',
        dropdown: true,
        noPoints: true,
        options: [
          { value: 0, label: '0 — No' },
          { value: 15, label: '15 — Sí' },
        ],
      },
      {
        id: 'ayu',
        type: 'select',
        label: 'Ayuda para deambular',
        dropdown: true,
        noPoints: true,
        options: [
          { value: 0, label: '0 — Ninguna, reposo en cama o ayuda de enfermería' },
          { value: 15, label: '15 — Muletas, bastón o andador' },
          { value: 30, label: '30 — Se apoya en el mobiliario' },
        ],
      },
      {
        id: 'iv',
        type: 'select',
        label: 'Terapia intravenosa o vía heparinizada',
        dropdown: true,
        noPoints: true,
        options: [
          { value: 0, label: '0 — No' },
          { value: 20, label: '20 — Sí' },
        ],
      },
      {
        id: 'mar',
        type: 'select',
        label: 'Marcha',
        dropdown: true,
        noPoints: true,
        options: [
          { value: 0, label: '0 — Normal, reposo en cama o inmovilidad' },
          { value: 10, label: '10 — Débil' },
          { value: 20, label: '20 — Alterada o inestable' },
        ],
      },
      {
        id: 'men',
        type: 'select',
        label: 'Estado mental',
        dropdown: true,
        noPoints: true,
        options: [
          { value: 0, label: '0 — Consciente de sus limitaciones' },
          { value: 15, label: '15 — Olvida o sobreestima sus limitaciones' },
        ],
      },
    ],
    compute: (v) => {
      const ant = v.ant ?? 0
      const dx = v.dx ?? 0
      const ayu = v.ayu ?? 0
      const iv = v.iv ?? 0
      const mar = v.mar ?? 0
      const men = v.men ?? 0
      const total = ant + dx + ayu + iv + mar + men
      let interpretation: string
      let level: 'ok' | 'warn' | 'danger'
      if (total >= 45) {
        level = 'danger'
        interpretation =
          '🔴 Riesgo alto — medidas específicas de prevención de caídas y registro en el plan de cuidados'
      } else if (total >= 25) {
        level = 'warn'
        interpretation = '🟠 Riesgo medio — medidas preventivas estándar'
      } else {
        level = 'ok'
        interpretation = '🟢 Riesgo bajo — medidas básicas de seguridad'
      }
      return {
        main: `Morse ${total} / 125`,
        interpretation,
        level,
        details: [
          `Antecedente ${ant} · Diagnósticos ${dx} · Ayuda ${ayu} · Vía IV ${iv} · Marcha ${mar} · Mental ${men}`,
        ],
      }
    },
  },

  {
    id: 'dolor',
    name: 'Dolor (EVA y escala numérica)',
    shortName: 'Dolor · EVA',
    description:
      'Intensidad del dolor mediante escala visual analógica o escala numérica verbal.',
    category: CAT,
    specialty: ENF,
    inputs: [
      {
        id: 'd',
        type: 'select',
        label: 'Intensidad referida por el paciente',
        dropdown: true,
        noPoints: true,
        options: [
          { value: 0, label: '0 — Sin dolor' },
          { value: 1, label: '1' },
          { value: 2, label: '2' },
          { value: 3, label: '3' },
          { value: 4, label: '4' },
          { value: 5, label: '5' },
          { value: 6, label: '6' },
          { value: 7, label: '7' },
          { value: 8, label: '8' },
          { value: 9, label: '9' },
          { value: 10, label: '10 — El peor dolor imaginable' },
        ],
      },
    ],
    compute: (v) => {
      const d = v.d ?? 0
      let interpretation: string
      let level: 'ok' | 'warn' | 'danger'
      if (d === 0) {
        level = 'ok'
        interpretation = '🟢 Sin dolor — mantener la reevaluación pautada'
      } else if (d <= 3) {
        level = 'warn'
        interpretation =
          '🟡 Dolor leve — medidas no farmacológicas y analgesia de primer escalón si procede'
      } else if (d <= 6) {
        level = 'warn'
        interpretation =
          '🟠 Dolor moderado — revisar la pauta analgésica y reevaluar tras administrarla'
      } else {
        level = 'danger'
        interpretation = '🔴 Dolor intenso — analgesia de rescate y reevaluación precoz'
      }
      return {
        main: `Dolor ${d} / 10`,
        interpretation,
        level,
        details: ['Escala visual analógica o escala numérica verbal'],
      }
    },
  },
]
